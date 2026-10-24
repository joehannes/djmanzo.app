//! The website's own djmanzo packs, made, signed and checked by djmanzo's own
//! code (`app/`, the submodule), and the rules the website's upload checker
//! reads, written from the same code so the two cannot drift.
//!
//! ```text
//! packsmith rules OUT.json        what a keys pack may say, as djmanzo reads it
//! packsmith make SRC OUT          every pack source in SRC, signed, into OUT
//! packsmith check FILE.djpack…    djmanzo's verdict on each
//! packsmith fixtures OUT          keys packs of every way of being refused, and djmanzo's verdicts
//! packsmith key                   a new signing key (PKCS#8, base64) on stdout
//! ```
//!
//! `make` signs with the key in `PACKSMITH_KEY` (PKCS#8, base64): the crew's
//! key, kept as a secret and never in the repository. A pack's name stays
//! with the key it was first listed under, in Outboard as in djmanzo, so a
//! new version signed with another key is refused as an update.
//!
//! A source is a JSON file: `{ name, version, licence, description, author,
//! support, set }`, where `set` is a `dj_app::keysets::KeySet`. Besides
//! djmanzo's own checks, `make` holds a set to one rule of the website's: it
//! **adds to** djmanzo's keys and never takes one over. A key may open a group
//! on a letter djmanzo leaves free or add a key inside one of djmanzo's groups
//! where a letter is free; landing on a key djmanzo already has is refused,
//! where djmanzo itself would let the set's key win.

use base64::Engine as _;
use dj_app::keysets::KeySet;
use dj_app::leader::{self, Node};
use dj_app::packs;
use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;
use std::path::{Path, PathBuf};
use std::process::ExitCode;

/// One pack to make.
#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields)]
struct Source {
    name: String,
    version: String,
    licence: String,
    description: String,
    author: String,
    #[serde(default)]
    support: Vec<dj_app::account::Support>,
    set: KeySet,
}

/// What the website needs to check a keys pack as djmanzo does, short of
/// running djmanzo's action parser: the parts of `leader::runnable` that are
/// lists, the vocabulary the parser accepts, the set's own limits, and
/// djmanzo's tree, so the site can say which keys a set adds and where.
#[derive(Debug, Serialize)]
struct Rules {
    /// The commit of djmanzo these were written from.
    app: String,
    longest: usize,
    set: SetRules,
    panels: Vec<String>,
    boards: Vec<String>,
    ui: Vec<String>,
    guides: Vec<String>,
    switch_kinds: Vec<String>,
    vocabulary: Vec<Verb>,
    /// The first word of every action that is not a deck's, from every action
    /// djmanzo itself writes (the vocabulary's examples, its tree, its sets)
    /// that its parser accepts: the vocabulary does not name them all (`mic`,
    /// `automix`).
    action_heads: Vec<String>,
    /// Every key djmanzo builds under Space for two decks, as chains, with
    /// whether each is a group, and its label.
    tree: Vec<TreeKey>,
    /// The keyboard sets djmanzo ships, by id.
    builtin: BTreeMap<String, KeySet>,
    /// Where a maker may be thanked, as djmanzo's installer allows.
    support: Vec<SupportKind>,
}

#[derive(Debug, Serialize)]
struct SetRules {
    purposes: Vec<String>,
    editions: Vec<String>,
    most: usize,
    name: usize,
    about: usize,
}

#[derive(Debug, Serialize)]
struct Verb {
    target: &'static str,
    verb: &'static str,
    argument: &'static str,
    min: Option<f32>,
    max: Option<f32>,
    help: &'static str,
    example: &'static str,
}

#[derive(Debug, Serialize)]
struct TreeKey {
    keys: Vec<String>,
    label: String,
    group: bool,
}

#[derive(Debug, Serialize)]
struct SupportKind {
    kind: &'static str,
    name: &'static str,
    hosts: Vec<&'static str>,
}

/// djmanzo's tree for two decks, as a DJ with nothing of their own has it.
fn default_tree() -> (Node, Vec<String>) {
    let activities = dj_app::activity::all(&[]);
    let workspaces = dj_app::cockpit::workspaces();
    let presets = dj_presets::builtin::packs();
    let tree = leader::tree(2, &activities, &workspaces, &presets);
    let mut switches: Vec<String> = activities.iter().map(|a| format!("activity {}", a.slug)).collect();
    switches.extend(workspaces.iter().map(|w| format!("workspace {}", w.name)));
    (tree, switches)
}

fn walk(node: &Node, path: &mut Vec<String>, out: &mut Vec<TreeKey>) {
    for child in &node.children {
        path.push(child.key.clone());
        out.push(TreeKey { keys: path.clone(), label: child.label.clone(), group: child.run.is_none() });
        walk(child, path, out);
        path.pop();
    }
}

fn app_commit() -> String {
    let app = Path::new(env!("CARGO_MANIFEST_DIR")).join("../../app");
    std::process::Command::new("git")
        .arg("-C")
        .arg(&app)
        .args(["rev-parse", "HEAD"])
        .output()
        .ok()
        .filter(|o| o.status.success())
        .map(|o| String::from_utf8_lossy(&o.stdout).trim().to_owned())
        .unwrap_or_default()
}

fn runs_of(node: &Node, out: &mut Vec<String>) {
    if let Some(run) = &node.run {
        out.push(run.clone());
    }
    for child in &node.children {
        runs_of(child, out);
    }
}

/// Every action djmanzo itself writes — its tree, its sets, its vocabulary's
/// examples — that its parser accepts, the current deck read as deck 1.
fn own_actions(tree: &Node) -> Vec<String> {
    let mut runs = Vec::new();
    runs_of(tree, &mut runs);
    for (_, set) in dj_app::keysets::builtin() {
        runs.extend(set.keys.into_iter().map(|k| k.run));
    }
    let mut actions: Vec<String> = runs
        .iter()
        .filter_map(|r| r.strip_prefix("action "))
        .map(|a| a.replace(&format!("deck {} ", leader::CURRENT), "deck 1 "))
        .collect();
    actions.extend(dj_core::vocabulary::vocabulary().iter().map(|v| v.example.to_owned()));
    actions.retain(|a| dj_core::action::Action::parse(a).is_ok());
    actions
}

/// The deck verbs djmanzo's own actions use that its vocabulary does not
/// describe (`sync_toggle`), each with the shape of argument its parser
/// takes, found by asking the parser.
fn unlisted_deck_verbs(tree: &Node) -> Vec<Verb> {
    let listed: Vec<&str> = dj_core::vocabulary::vocabulary().iter().map(|v| v.verb).collect();
    let mut seen: Vec<String> = own_actions(tree)
        .iter()
        .filter_map(|a| a.strip_prefix("deck 1 "))
        .filter_map(|rest| rest.split_whitespace().next())
        .filter(|verb| !listed.contains(verb))
        .map(str::to_owned)
        .collect();
    seen.sort();
    seen.dedup();
    let parses = |a: String| dj_core::action::Action::parse(&a).is_ok();
    seen.into_iter()
        .map(|verb| {
            let argument = if parses(format!("deck 1 {verb}")) {
                "none"
            } else if parses(format!("deck 1 {verb} 1")) {
                "number"
            } else {
                "words"
            };
            let verb: &'static str = Box::leak(verb.into_boxed_str());
            Verb { target: "deck", verb, argument, min: None, max: None, help: "", example: "" }
        })
        .collect()
}

fn action_heads(tree: &Node) -> Vec<String> {
    let actions = own_actions(tree);
    let mut heads: Vec<String> = actions
        .iter()
        .filter_map(|a| a.split_whitespace().next())
        .filter(|h| *h != "deck")
        .map(str::to_owned)
        .collect();
    heads.sort();
    heads.dedup();
    heads
}

fn rules() -> Rules {
    use dj_core::vocabulary::{ArgSpec, Target};
    let (tree, _) = default_tree();
    let mut keys = Vec::new();
    walk(&tree, &mut Vec::new(), &mut keys);
    Rules {
        app: app_commit(),
        longest: leader::LONGEST,
        set: SetRules {
            purposes: dj_app::keysets::PURPOSES.iter().map(|s| (*s).to_owned()).collect(),
            editions: dj_app::keysets::EDITIONS.iter().map(|s| (*s).to_owned()).collect(),
            most: dj_app::keysets::MOST,
            name: dj_app::keysets::NAME,
            about: dj_app::keysets::ABOUT,
        },
        panels: dj_app::cockpit::surfaces().iter().map(|s| s.name.to_owned()).collect(),
        boards: dj_app::boards::all().into_iter().map(|b| b.slug.into_owned()).chain([dj_app::boards::DECKS.to_owned()]).collect(),
        ui: leader::UI_VERBS.iter().map(|s| (*s).to_owned()).collect(),
        guides: dj_app::guide::Topic::ALL.iter().map(|t| t.slug().to_owned()).collect(),
        switch_kinds: ["activity", "preset", "theme", "workspace"].map(str::to_owned).to_vec(),
        vocabulary: dj_core::vocabulary::vocabulary()
            .iter()
            .map(|v| {
                let (argument, min, max) = match v.argument {
                    ArgSpec::None => ("none", None, None),
                    ArgSpec::Number { min, max } => ("number", Some(min), Some(max)),
                    ArgSpec::Frames => ("frames", None, None),
                    ArgSpec::Words => ("words", None, None),
                };
                Verb {
                    target: match v.target {
                        Target::Deck => "deck",
                        Target::Mixer => "mixer",
                    },
                    verb: v.verb,
                    argument,
                    min,
                    max,
                    help: v.help,
                    example: v.example,
                }
            })
            .chain(unlisted_deck_verbs(&tree))
            .collect(),
        action_heads: action_heads(&tree),
        tree: keys,
        builtin: dj_app::keysets::builtin().into_iter().map(|(slug, set)| (dj_app::keysets::builtin_id(slug), set)).collect(),
        support: dj_app::account::KINDS.iter().map(|(kind, name, hosts)| SupportKind { kind, name, hosts: hosts.to_vec() }).collect(),
    }
}

/// The website's rule over djmanzo's: a set adds keys and takes none over.
fn adds_only(tree: &Node, set: &KeySet, switches: &[String]) -> Result<(), String> {
    for key in &set.keys {
        let chain = key.keys.join(" ");
        leader::check(tree, key, switches).map_err(|why| format!("Space {chain}: {why}"))?;
        // `check` lets a key land on one of djmanzo's leaves, and the set's
        // would win there; this one does not.
        let mut here = Some(tree);
        for k in &key.keys {
            here = here.and_then(|node| node.children.iter().find(|c| &c.key == k));
        }
        if let Some(own) = here.filter(|node| node.run.is_some()) {
            return Err(format!("Space {chain} is djmanzo's own ({}): a set from the website adds keys, it does not take one over", own.label));
        }
    }
    Ok(())
}

fn key_from_env() -> Result<Vec<u8>, String> {
    let text = std::env::var("PACKSMITH_KEY").map_err(|_| "PACKSMITH_KEY is not set: the crew's signing key, PKCS#8 in base64".to_owned())?;
    let pkcs8 = base64::engine::general_purpose::STANDARD.decode(text.trim()).map_err(|_| "PACKSMITH_KEY is not base64".to_owned())?;
    packs::public_key(&pkcs8)?;
    Ok(pkcs8)
}

/// One source made into a checked pack, and its file name.
fn make_one(path: &Path, pkcs8: &[u8], tree: &Node, switches: &[String]) -> Result<(String, Vec<u8>, packs::Checked), String> {
    let text = std::fs::read_to_string(path).map_err(|e| format!("{}: {e}", path.display()))?;
    let source: Source = serde_json::from_str(&text).map_err(|e| format!("{}: {e}", path.display()))?;
    adds_only(tree, &source.set, switches).map_err(|why| format!("{}: {why}", path.display()))?;
    let making = packs::Making {
        name: source.name,
        author: source.author,
        licence: source.licence,
        version: source.version,
        description: source.description,
        presets: Vec::new(),
        theirs: true,
        support: source.support,
    };
    let checked = packs::make_keys(&making, &source.set, pkcs8).map_err(|why| format!("{}: {why}", path.display()))?;
    let bytes = packs::archive(&checked)?;
    // Read back as an installer reads a file: what is written is what installs.
    let again = packs::check(read_bytes(&bytes)?).map_err(|why| format!("{}: made, then refused: {why}", path.display()))?;
    let id = packs::id(&again.manifest.name, &base64::engine::general_purpose::STANDARD.decode(&again.manifest.key).map_err(|e| e.to_string())?);
    let file = format!("{id}-{}.djpack", again.manifest.version.replace(|c: char| !(c.is_ascii_alphanumeric() || ".-_".contains(c)), "_"));
    Ok((file, bytes, again))
}

fn read_bytes(bytes: &[u8]) -> Result<packs::Files, String> {
    let dir = std::env::temp_dir().join(format!("packsmith-{}", std::process::id()));
    std::fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    let file = dir.join("pack.djpack");
    std::fs::write(&file, bytes).map_err(|e| e.to_string())?;
    let files = packs::read_archive(&file);
    let _ = std::fs::remove_dir_all(&dir);
    files
}

fn run() -> Result<(), String> {
    let args: Vec<String> = std::env::args().skip(1).collect();
    match args.first().map(String::as_str) {
        Some("rules") => {
            let out = args.get(1).ok_or("packsmith rules OUT.json")?;
            let json = serde_json::to_string_pretty(&rules()).map_err(|e| e.to_string())?;
            std::fs::write(out, json + "\n").map_err(|e| format!("{out}: {e}"))?;
            println!("rules: written to {out}");
            Ok(())
        }
        Some("make") => {
            let (src, out) = match (args.get(1), args.get(2)) {
                (Some(s), Some(o)) => (PathBuf::from(s), PathBuf::from(o)),
                _ => return Err("packsmith make SRC OUT".to_owned()),
            };
            let pkcs8 = key_from_env()?;
            let (tree, switches) = default_tree();
            let mut sources: Vec<PathBuf> = std::fs::read_dir(&src)
                .map_err(|e| format!("{}: {e}", src.display()))?
                .filter_map(Result::ok)
                .map(|e| e.path())
                .filter(|p| p.extension().is_some_and(|x| x == "json"))
                .collect();
            sources.sort();
            std::fs::create_dir_all(&out).map_err(|e| e.to_string())?;
            let mut index = Vec::new();
            for path in &sources {
                let (file, bytes, checked) = make_one(path, &pkcs8, &tree, &switches)?;
                std::fs::write(out.join(&file), &bytes).map_err(|e| e.to_string())?;
                println!("made {file}: {} ({} keys, key {})", checked.manifest.name, checked.manifest.keys.as_ref().map_or(0, |s| s.keys.len()), checked.fingerprint());
                index.push(serde_json::json!({
                    "file": file,
                    "name": checked.manifest.name,
                    "version": checked.manifest.version,
                    "sha256": packs::sha256(&bytes),
                }));
            }
            // What the website lists from (`worker/seed.ts`): every pack made, by file.
            let json = serde_json::to_string_pretty(&serde_json::json!({ "packs": index })).map_err(|e| e.to_string())?;
            std::fs::write(out.join("index.json"), json + "\n").map_err(|e| e.to_string())?;
            Ok(())
        }
        Some("check") => {
            let mut refused = 0;
            for file in &args[1..] {
                match packs::read_archive(Path::new(file)).and_then(packs::check) {
                    Ok(pack) => println!("{file}: installs ({} {}, key {})", pack.manifest.name, pack.manifest.version, pack.fingerprint()),
                    Err(why) => {
                        refused += 1;
                        println!("{file}: refused: {why}");
                    }
                }
            }
            if refused > 0 { Err(format!("{refused} refused")) } else { Ok(()) }
        }
        Some("fixtures") => fixtures(Path::new(args.get(1).ok_or("packsmith fixtures OUT")?)),
        Some("key") => {
            let pkcs8 = ring_key()?;
            println!("{}", base64::engine::general_purpose::STANDARD.encode(&pkcs8));
            eprintln!("public key: {}", packs::public_key(&pkcs8)?);
            Ok(())
        }
        _ => Err("packsmith rules OUT.json | make SRC OUT | check FILE… | fixtures OUT | key".to_owned()),
    }
}

/// One keys pack for the fixtures: `edit` changes a good set or manifest
/// before it is signed, the way an upload could have it.
fn fixture(pkcs8: &[u8], edit: impl FnOnce(&mut packs::Manifest)) -> Result<(Vec<u8>, String), String> {
    let set = KeySet {
        name: "Fixture keys".to_owned(),
        about: "Keys for a test.".to_owned(),
        purpose: "karaoke".to_owned(),
        edition: "karaoke".to_owned(),
        keys: vec![
            leader::Mine { keys: vec!["k".into(), "g".into()], label: "Guide".into(), run: "action deck @ voice 0.25".into() },
            leader::Mine { keys: vec!["k".into(), "p".into()], label: "Singers".into(), run: "surface karaoke".into() },
            leader::Mine { keys: vec!["s".into(), "g".into()], label: "Guide too".into(), run: "action deck @ voice 0.25".into() },
        ],
    };
    let mut manifest = packs::Manifest {
        format: packs::FORMAT,
        name: "Fixture keys".to_owned(),
        author: "packsmith".to_owned(),
        licence: "CC0-1.0".to_owned(),
        version: "1.0.0".to_owned(),
        description: String::new(),
        key: packs::public_key(pkcs8)?,
        files: BTreeMap::new(),
        kind: packs::Kind::Keys,
        looks: Vec::new(),
        theme: None,
        skins: Vec::new(),
        technique: None,
        keys: Some(set),
        knowledge: None,
        lessons: Vec::new(),
        support: Vec::new(),
    };
    edit(&mut manifest);
    let bytes = serde_json::to_vec_pretty(&manifest).map_err(|e| e.to_string())?;
    let mut files = packs::Files::new();
    files.insert(packs::SIGNATURE.to_owned(), packs::sign(&bytes, pkcs8)?);
    files.insert(packs::MANIFEST.to_owned(), bytes);
    let verdict = match packs::check(files.clone()) {
        Ok(_) => "ok".to_owned(),
        Err(why) => why,
    };
    // Written whole, as `archive` would a checked pack, so a refused one can be uploaded too.
    use std::io::Write as _;
    let mut zip = zip::ZipWriter::new(std::io::Cursor::new(Vec::new()));
    for (path, data) in &files {
        zip.start_file(path.as_str(), zip::write::SimpleFileOptions::default()).map_err(|e| e.to_string())?;
        zip.write_all(data).map_err(|e| e.to_string())?;
    }
    Ok((zip.finish().map_err(|e| e.to_string())?.into_inner(), verdict))
}

fn fixtures(out: &Path) -> Result<(), String> {
    type Edit = Box<dyn FnOnce(&mut packs::Manifest)>;
    let set = |f: fn(&mut KeySet)| -> Edit { Box::new(move |m: &mut packs::Manifest| f(m.keys.as_mut().expect("a set"))) };
    let run = |run: &'static str| -> Edit { Box::new(move |m: &mut packs::Manifest| m.keys.as_mut().expect("a set").keys[0].run = run.to_owned()) };
    let key = |k: &'static [&'static str]| -> Edit { Box::new(move |m: &mut packs::Manifest| m.keys.as_mut().expect("a set").keys[0].keys = k.iter().map(|s| (*s).to_owned()).collect()) };
    let cases: Vec<(&str, Edit)> = vec![
        ("keys-good", Box::new(|_| {})),
        ("keys-no-set", Box::new(|m| m.keys = None)),
        ("keys-with-a-look", Box::new(|m| m.looks = vec![dj_app::looks::Look { name: "x".into(), description: String::new(), layers: Vec::new() }])),
        ("keys-unknown-edition", set(|s| s.edition = "wedding".into())),
        ("keys-no-name", set(|s| s.name = "  ".into())),
        ("keys-long-name", set(|s| s.name = "n".repeat(49))),
        ("keys-long-about", set(|s| s.about = "a".repeat(401))),
        ("keys-unknown-purpose", set(|s| s.purpose = "wedding".into())),
        ("keys-none", set(|s| s.keys.clear())),
        ("keys-too-many", set(|s| {
            let one = s.keys[0].clone();
            s.keys = (0..65).map(|i| leader::Mine { keys: vec!["k".into(), char::from(b'!' + i as u8).to_string()], ..one.clone() }).collect();
        })),
        ("keys-chain-too-long", key(&["k", "a", "b", "c", "d"])),
        ("keys-not-a-key", key(&["k", "ab"])),
        ("keys-unnamed", set(|s| s.keys[0].label = " ".into())),
        ("keys-twice", set(|s| s.keys[1].keys = s.keys[0].keys.clone())),
        ("keys-unknown-panel", run("surface nowhere")),
        ("keys-unknown-board", run("board nowhere")),
        ("keys-unknown-ui", run("ui fly")),
        ("keys-unknown-guide", run("guide nowhere")),
        ("keys-switch-what", run("switch mood happy")),
        ("keys-switch-nothing", run("switch theme ")),
        ("keys-unknown-kind-of-key", run("teleport home")),
        ("keys-unknown-verb", run("action deck @ fly")),
        ("keys-unknown-mixer", run("action spaceship on")),
        ("keys-support-elsewhere", Box::new(|m| m.support = vec![dj_app::account::Support { kind: "patreon".into(), url: "https://example.org/me".into() }])),
        ("keys-support-http", Box::new(|m| m.support = vec![dj_app::account::Support { kind: "kofi".into(), url: "http://ko-fi.com/me".into() }])),
        ("keys-support-unknown", Box::new(|m| m.support = vec![dj_app::account::Support { kind: "venmo".into(), url: "https://venmo.com/me".into() }])),
        ("keys-support-good", Box::new(|m| m.support = vec![dj_app::account::Support { kind: "patreon".into(), url: "https://www.patreon.com/me".into() }])),
        ("keys-takes-over", key(&["d", "p"])),
    ];
    let pkcs8 = ring_key()?;
    std::fs::create_dir_all(out).map_err(|e| e.to_string())?;
    let mut verdicts = BTreeMap::new();
    for (name, edit) in cases {
        let (bytes, verdict) = fixture(&pkcs8, edit)?;
        let file = format!("{name}.djpack");
        std::fs::write(out.join(&file), bytes).map_err(|e| e.to_string())?;
        verdicts.insert(file, verdict);
    }
    let json = serde_json::to_string_pretty(&verdicts).map_err(|e| e.to_string())?;
    std::fs::write(out.join("verdicts.json"), json + "\n").map_err(|e| e.to_string())?;
    println!("fixtures: {} packs and djmanzo's verdicts in {}", verdicts.len(), out.display());
    Ok(())
}

/// A new key, as djmanzo makes a DJ's: through its own `signing_key`, in a
/// folder of its own that is removed afterwards.
fn ring_key() -> Result<Vec<u8>, String> {
    let dir = std::env::temp_dir().join(format!("packsmith-key-{}", std::process::id()));
    let key = packs::signing_key(&dir);
    let _ = std::fs::remove_dir_all(&dir);
    key
}

fn main() -> ExitCode {
    match run() {
        Ok(()) => ExitCode::SUCCESS,
        Err(why) => {
            eprintln!("packsmith: {why}");
            ExitCode::FAILURE
        }
    }
}
