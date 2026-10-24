# Community spaces, marketplaces and special offers for a creative tool's site

Scope: how creative-tool ecosystems design marketplaces for user-made add-ons, forums, feedback and wishlists, place-like community spaces, and sales moments, with notes on EU law (DSA, UCPD, Price Indication Directive, the planned Digital Fairness Act). This feeds the djmanzo site, which hosts a free user-to-user marketplace of themes, skins and visuals with donation links, a Reddit-like forum with trust levels, a wishlist with statuses, and future special offers.

Research date: 2026-10-19. Twenty tool calls in total. Many search results were secondary sources (law-firm commentary, fan wikis, vendor blogs). Where that matters, it is flagged next to the finding. Several platforms named in the brief could not be covered with sources and are listed under Gaps.

## 1. Marketplaces for creative add-ons: presentation, discovery, trust and tips

### Takeaway
The marketplaces that work best show a live preview of the item before any commitment, put a real person behind each item through creator pages, and treat trust as a visible signal: review status, scorecards, verified badges. Tipping is usually a link out to the creator's own funding page rather than an in-store payment. A badge alone does not prove an item is safe. VS Code's "verified" badge was obtained with a $5 domain.

### Cited Findings
**Preview and try-before-install (Figma Community)**
- Every Figma Community file has a resource page where you can preview the file or prototype as an interactive embed. "Open in Figma" duplicates a copy into your drafts with "(Community)" added to its name — [Figma Help: Publish files to Community](https://help.figma.com/hc/en-us/articles/360040035974--Beta-Publish-a-File-to-your-Profile)
- For paid Figma files, only the first page is viewable before purchase. Figma "strongly recommend[s]" structuring the file so the first page works as a preview — [Figma Help](https://help.figma.com/hc/en-us/articles/360040035974--Beta-Publish-a-File-to-your-Profile)
- Figma Community introduced "remix": duplicate a file, customise it, and publish your own version. Creator profiles let individual designers present their work — [Really Good Emails archive of Figma Community beta update](https://reallygoodemails.com/emails/figma-community-beta-update-7-new-features-to-try/text); [UX Collective, "Figma Community: the GitHub for designers"](https://uxdesign.cc/figma-community-the-github-for-designers-b2261d4d21be)
- Figma Community files carry explicit licences (a Community licence page exists) — [Figma Help: Community Licenses](https://help.figma.com/hc/en-us/articles/360038510873-Community-Licenses)

**Review, moderation and donations (Blender Extensions)**
- extensions.blender.org has a public approval queue with statuses such as "awaiting review" and "awaiting changes". Community members are invited to test queued submissions and comment — [Blender Extensions approval queue](https://extensions.blender.org/approval-queue); [Blender DevTalk, Extensions Platform thread](https://devtalk.blender.org/t/extensions-platform/34663?page=19)
- The 2022 platform proposal set out these rules: extensions must be self-contained, must not load remote code for execution, and must not use obfuscated code. Linking to external funding platforms in the description is allowed. No paywalls, keys or registration may block functionality — [Blender Code blog, "Blender Extensions Platform" (2022)](https://code.blender.org/2022/10/blender-extensions-platform/) (a proposal; current guidelines may differ)
- Each extension has a reviews page (e.g. the "gold" theme) and reviews can be reported to moderators. Reviews are "not meant as a bug tracker" — [extensions.blender.org theme reviews](https://extensions.blender.org/themes/gold/reviews); [DevTalk thread](https://devtalk.blender.org/t/extensions-platform/34663?page=19)
- The platform's code moved abuse reports so that only moderators can view them — [Blender extensions-website repository](https://projects.blender.org/infrastructure/extensions-website/src/tag/20240404-143833)
- Blender Extensions hosts **themes** as a first-class category alongside add-ons. This is directly analogous to djmanzo skins — [extensions.blender.org/themes/gold/reviews](https://extensions.blender.org/themes/gold/reviews)

**Automated safety scorecards (Obsidian)**
- Obsidian now automatically scans every plugin *version* for security vulnerabilities, code-quality issues and malware. It shows the result as a "safety scorecard" on each plugin's directory page. Manual review continues for popular, featured and flagged plugins — [Obsidian Help: Plugin security](https://obsidian.md/help/plugin-security)
- Previously, initial submissions were manually reviewed by a "small team". Plugins that fail the new review will be phased out. Scorecards are to add "disclosures, privacy labels, artifact attestation, manual review results" — [Obsidian blog, "Future of plugins"](https://obsidian.md/ko/blog/future-of-plugins/) (language variant URL; undated in the result)

**Verified badges are weak on their own (VS Code Marketplace)**
- Microsoft says the verified-publisher badge requires a verified domain and good standing for at least 6 months. In 2025 it reviewed 136 extensions for malicious code and removed 110; removed extensions are also blocked inside VS Code — [Microsoft Developer Blog, "Security and trust in Visual Studio Marketplace" (11 June 2025)](https://developer.microsoft.com/blog/security-and-trust-in-visual-studio-marketplace/)
- Researchers built a typosquatted "Darcula" theme, bought darculatheme.com, and obtained a verified badge. Auto-update by default lets a malicious publisher push a supply-chain attack silently — [Cybersecurity News](https://cybersecuritynews.com/flaws-vs-code-marketplace-malicious-extensions); [SC World](https://scworld.com/news/vscode-extensions-with-malicious-code-installed-229m-times)
- A 2026 analysis argues the badge validates the publisher account, not individual releases (single write-up, treat with caution) — [Cloud Security Alliance research note](https://labs.cloudsecurityalliance.org/research/csa-research-note-vscode-extension-supply-chain-breach-20260/)

**Pay-what-you-want and tips (itch.io, Gumroad)**
- On itch.io, "all purchases and donations … are pay-what-you-want above the minimum", and the minimum can be zero. Sellers choose the platform's revenue share (default 10%, can be 0%). itch.io said in 2015 that it accepted the risk that everyone sets 0% "in the spirit of community support" — [itch.io docs](https://itch.io/docs); [itch.io Creator FAQ](https://itch.io/developers/faq); [MCV/Develop](https://mcvuk.com/?p=70522)
- Gumroad: a price of "0+" means pay-what-you-want with a free option. Any non-zero payment must be at least $0.99. Creators can set a separate *suggested* amount shown to buyers — [Gumroad Help: Pay what you want pricing](https://gumroad.com/help/article/133-pay-what-you-want-pricing)
- A third-party claim that PWYW without a strong suggested price lowers average transaction value comes from the publisher's own unverified dataset — [ecomm.design Gumroad review](https://ecomm.design/gumroad-review/) (unverified)

### Inferences
- djmanzo is free-only with donation links, so Blender's model fits most closely: free items, external funding links allowed in the listing, nothing in the item gated behind payment.
- For skins and visuals, "preview" should mean seeing the item running. Figma's interactive embed is the model: render a skin onto a mock deck, or play a visual loop, on the item page before download.
- Show trust as a scorecard, the way Obsidian does: reviewed or not, file type checks passed, licence, last updated. A badge alone is not enough, as the VS Code case shows. Theme and visual packs should be data-only (no executable code), following Blender's "no remote code / no obfuscation" rule.
- Remix lineage ("based on X by @creator") rewards creators and makes browsing feel like a family tree. This suits skins especially well.
- Donation UX: one clear "Support this creator" link per item and per creator page. An optional suggested amount works only if the site processes payments itself. Linking out to the creator's own Ko-fi or Liberapay page avoids djmanzo touching money for third parties. That last point is an inference about regulatory and operational simplicity, not something a source states.

### Gaps
- No sourced findings were gathered for Raycast Store, VCV Library, Ableton Packs, Native Access, Splice, Serato or rekordbox skins, Steam Workshop, or Ko-fi shops. The searches returned nothing usable within the budget. Their preview, rating and creator-page patterns are therefore unverified here.
- No current (2026) text of Blender's live extension guidelines was retrieved; the 2022 proposal may have been superseded.

## 2. Forums and chat: trust levels, moderation, kindness, quality

### Takeaway
Discourse's trust-level system is the most fully documented model. It sandboxes newcomers, rewards *reading* before posting, and gradually hands clear-cut moderation (spam hiding, recategorising) to established regulars, so staff handle only the hard cases. Since 2023 Discourse has also let admins grant specific permissions through groups rather than only through trust levels.

### Cited Findings
- Discourse states two goals: keep new users from harming themselves or others while they learn ("Sandboxing new users"), and give experienced members power to help run the community. "The community polices itself for clear-cut cases" — [Discourse blog, Understanding Discourse Trust Levels](https://blog.discourse.org/2018/06/understanding-discourse-trust-levels/)
- **TL0 (New)** cannot send personal messages, flag, or attach files. Posts are limited to one image, two links and two mentions, and cannot be edited after 24 hours. Some advanced UI is hidden. A "bootstrap mode" gives the first 50 sign-ups TL1 automatically — [Discourse blog](https://blog.discourse.org/2018/06/understanding-discourse-trust-levels/)
- **TL1 (Basic)** is reached by entering 5 topics, reading 30 posts and spending 10 minutes reading. Reading is called "the most fundamental and healthy action in any community" — [Discourse blog](https://blog.discourse.org/2018/06/understanding-discourse-trust-levels/); [Discourse Meta, Trust Levels: a detailed explanation](https://meta.discourse.org/t/discourse-trust-levels-a-detailed-explanation/396792/1)
- **TL2 (Member)** requires visits on 15 days, giving and receiving a like, 3 replies, 20 topics entered, 100 posts read and 60 minutes reading. It unlocks invites and higher daily limits — [Discourse blog](https://blog.discourse.org/2018/06/understanding-discourse-trust-levels/)
- **TL3 (Regular)** is measured over a rolling 100 days. Requirements include visiting 50% of days, likes given and received across distinct users, no more than 5 confirmed spam flags, and no suspension in 6 months. TL3 is the only level that can be lost (with a 2-week grace period). TL3 members can recategorise and rename topics. Their spam flags on a TL0 post hide it immediately, and enough TL3 flags auto-silence a TL0 user. Discourse notes the 50% visit rule is often too high — [Discourse blog](https://blog.discourse.org/2018/06/understanding-discourse-trust-levels/)
- **TL4 (Leader)** is granted manually by staff and should be used sparingly. These members can edit all posts, pin, close, split and merge topics — [Discourse blog](https://blog.discourse.org/2018/06/understanding-discourse-trust-levels/)
- From 2023 to 2025 Discourse migrated more than 30 settings from trust-level gates to custom groups — [Discourse blog (updated note)](https://blog.discourse.org/2018/06/understanding-discourse-trust-levels/)
- Admins can tune thresholds, and forums vary (e.g. a forum citing 15 topics, 40 posts, 30 minutes for TL1). Many communities publish a plain-language "why can't I do X?" explainer — [Look Mum No Computer forum](https://lookmumnocomputer.discourse.group/t/discourse-trust-levels-aka-why-cant-i-do-x/964); [Fairphone forum](https://forum.fairphone.com/t/forum-user-access-levels-explained/665); [OpenWrt forum new-user restrictions](https://forum.openwrt.org/t/new-user-restrictions/245369)
- Blender's extension reviews are not a bug tracker; problems with an extension go to moderators via report. This is an example of linking discussion to items while keeping each channel's purpose distinct — [Blender DevTalk](https://devtalk.blender.org/t/extensions-platform/34663?page=19)

### Inferences
- djmanzo's forum already has trust levels. The useful additions are a published "why can't I do X yet?" page written in a friendly voice, a TL1 unlocked by reading (not posting), and a small-community setting for TL3-style thresholds, since Discourse itself says 50% visits is too high.
- Let trusted regulars hide obvious spam instantly, with staff reviewing afterwards. That keeps a tiny team viable.
- Link each marketplace item to its own forum thread ("Talk about this skin"), with reviews and bug reports kept separate.
- New-user limits (two links, one image) are a strong defence against the spam that marketplaces with external donation links will attract.

### Gaps
- No sourced material was gathered on Discord servers for music software, the Ableton or Native Instruments forums, the VirtualDJ forum, Reddit rule and onboarding patterns, or "good first post" onboarding. Search budget ran out before these.
- No source found on codes of conduct specific to music-software communities.

## 3. Feedback and wishlists: statuses, voting fairness, closing the loop

### Takeaway
Status lifecycles are converging on "Under review → Planned → In progress → Complete/Shipped", with an honest "Not planned/Closed". The known failure of public voting is that it amplifies a vocal minority and snowballs early leaders, so votes should be one input among several. Closing the loop means linking "Complete" items to a changelog entry.

### Cited Findings
- Canny's public roadmap shows Planned, In Progress and Complete by default. Once a changelog entry is published, it switches to Under Review, Planned and In Progress, on the assumption that completed items are announced in the changelog. Custom statuses require paid plans — [Canny Help: Public roadmap](https://intercom.help/canny/en/articles/3828148-public-roadmap)
- ClickUp (a Canny user) published a fuller lifecycle with descriptions: Open, Future, Planned, Building Now, Beta, Completed, Not On The Roadmap, Closed — [ClickUp feedback changelog, "New & improved feature request statuses"](https://feedback.clickup.com/changelog/new-improved-feature-request-statuses)
- Voting boards reflect participation inequality (Nielsen's 90-9-1). Top-voted items attract more votes and crowd out others ("snowball"). Votes capture a chosen solution rather than the underlying problem. An unmanaged board of duplicates signals that feedback does not matter — [Savio, feature voting pitfalls](https://www.savio.io/blog/feature-voting); [ProdPad, feedback voting bias](https://www.prodpad.com/blog/feedback-voting-bias-in-product-decisions/); [Released, pitfalls of voting on public roadmaps](https://www.released.so/articles/understanding-the-pitfalls-of-voting-on-public-roadmaps) (vendor blogs with an interest in alternatives)
- Best-practice advice is to keep statuses current and answer new ideas promptly — [ProductLift, feature voting best practices](https://www.productlift.dev/blog/feature-voting-best-practices/) (vendor blog)

### Inferences
- djmanzo's wishlist should have explicit statuses with one-line public definitions, including "Not planned (and why)". An honest no builds more trust than an item left open forever.
- To counter snowballing: sort by "new" or "trending" by default rather than all-time votes, merge duplicates visibly, and ask for the *problem* ("what were you trying to do?") in the submission form.
- To close the loop, make each shipped wishlist item link to the release note, and notify voters. A seasonal "You asked, we built" wall makes this visible and celebratory, and doubles as an event moment.

### Gaps
- No sourced findings for Featurebase's status model, Linear's public roadmaps, GitHub Discussions (answer marking and upvotes), or Raycast, Arc or Notion public roadmaps.
- No source found confirming voter-notification mechanics in Canny or Featurebase.

## 4. Place-like community design: venues, hubs, seasonal events

### Takeaway
What lasts from virtual worlds is a predictable calendar of themed events that redecorate the *central* spaces, a small free keepsake for attending, and room for the community to host its own events. Web sale mini-games show a risk: Steam's Saliens (2018) and Grand Prix (2019) drew scripting and complaints that the biggest team always won. Collectible stickers proved more durable.

### Cited Findings
- Club Penguin held roughly one party a month tied to seasons, holidays and anniversaries, plus minor events. Central hubs (Town, Plaza, Snow Forts) were almost always decorated while remote rooms rarely were. Most parties offered at least one free item. Some events were planned years ahead — [Club Penguin Wiki: Parties portal](https://clubpenguin.fandom.com/wiki/Portal:Parties); [List of Parties and Events in 2008](https://clubpenguin.fandom.com/wiki/List_of_Parties_and_Events_in_2008) (fan wikis)
- Habbo's core was social interactivity in public lobbies and user-decorated rooms. Events were run both by staff and by community members. User-generated rooms fostered ownership — [Habborator research PDF](https://www.habborator.org/docs/files/contagious.pdf); [hyperPad, Lessons from Habbo Hotel](https://www.hyperpad.com/blog/lessons-from-habbo-hotel)
- The Steam Summer Sale 2018 web mini-game *Saliens* was widely automated with scripts. Kotaku called it "not very good". Large groups "kinda just win by default" — [Kotaku](https://kotaku.com/players-are-cheating-the-steam-summer-sale-game-but-th-1827062509); [GameStar](https://www.gamestar.de/artikel/steam-summer-sale-bei-valves-spiel-zum-sale-wird-ordentlich-geschummelt,3331533.html); [Lowyat](https://lowyat.net/2018/164943/the-steam-summer-sale-has-begun-comes-with-a-mini-game-this-year)
- Steam Grand Prix (2019) is remembered in one forum comment as an event where the team with most members won every time, with an XP bug — [Steam Community discussion](https://steamcommunity.com/discussions/forum/0/2850173019346298935) (anecdotal)
- Saliens still draws nostalgia: a 2023 user called it "a cute minigame" they would like back — [Steam Community discussion (2023)](https://steamcommunity.com/discussions/forum/1/3811782223864421221)
- Recent Steam sales (Spring, Autumn and Lunar New Year 2025) use free collectible animated stickers, often earned by browsing the Discovery Queue, plus points-shop items and "Steam Awards" voting during the Winter Sale — [GameStar Lunar Sale 2025](https://www.gamestar.de/artikel/steam-lunar-sale-2025-uebersicht,3426675.html); [TroubleChute, Autumn Sale 2025](https://hub.tcno.co/videos/autumn-sale-free-stickers-best-cheapest-games-2025-steam-sale/); [Cultura Geek, Winter Sale 2025](https://culturageek.com.ar/steam-winter-sale-2025-hasta-cuando-dura-el-evento-cuales-son-las-mejores-ofertas-y-tips-para-comprar-mas-barato/) (secondary/video sources)

### Inferences
- The djmanzo site already has an immersive island map, so the Club Penguin rule applies directly: decorate the central "plaza" for each season or event, leave the edges calm, and give one free keepsake (a limited seasonal skin or sticker) to everyone who visits during the event.
- Prefer non-competitive, collect-and-browse mechanics (stickers for visiting marketplace stalls, a seasonal "passport") over team competitions. Steam's experience shows competitive meta-games get scripted and feel unfair.
- Let the community host: a "featured creator's stall" or "community night" in the forum, on Habbo's model of user-run events.
- Make the keepsake free and attendance-based, not purchase-gated. That keeps events from turning into pressure-selling (see section 5).

### Gaps
- No sourced findings on Animal Crossing's plaza, Nintendo eShop presentation, Gather, Spatial, Discord Stage, Spotify Wrapped, or advent-calendar case studies, nor on whether "town square" metaphors measurably work on marketing websites. These were not searched within budget, and no NN/g or Baymard evidence on spatial navigation was retrieved.
- Club Penguin details come from fan wikis, not Disney primary sources.

## 5. Special offers without dark patterns (EU law and honest staging)

### Takeaway
In the EU, a fake or resetting countdown is already unlawful under the UCPD blacklist (Annex I point 7). Every announced price reduction must show the lowest price of the previous 30 days (Price Indication Directive Art. 6a). DSA Art. 25 separately bars online platforms from deceptive or manipulative interface design. A Digital Fairness Act targeting fake urgency, confirmshaming and hard cancellation is planned but, as of these sources, not yet tabled. Honest offers need a real end date that is actually enforced, a truthful reference price, and no pressure copy.

### Cited Findings
- Fake countdown timers fall under UCPD Annex I point 7 ("falsely stating that a product will only be available for a very limited time"). Timers are deceptive when they "reset upon refreshing the page or after time-out, or if the offer remains valid after the expiration of the timer" — [Maastricht University Press, "Dark patterns as infringements of EU consumer law"](https://pubpub.maastrichtuniversitypress.nl/pub/chapter-6-dark-patterns-as-infringements-of-eu-consumer-law) (academic chapter)
- A 2022 EU sweep of 399 retail sites found fake countdown timers on 42 and at least one dark pattern on 148 — [Maastricht University Press chapter](https://pubpub.maastrichtuniversitypress.nl/pub/chapter-6-dark-patterns-as-infringements-of-eu-consumer-law)
- Consumer authorities warn shoppers about these patterns (urgency, scarcity, confirmshaming). Poland's watchdog has also challenged "permanent promotions" as misleading — [CCPC Ireland](https://www.ccpc.ie/consumers/2023/02/08/dark-patterns-warning-signs-when-shopping-online/); [Luxembourg Ministry of Consumer Protection](https://mpc.gouvernement.lu/en/dossiers/2024/dark-patterns.html); [Osborne Clarke on Poland's watchdog](https://www.osborneclarke.com/insights/permanent-promotions-mislead-consumers-says-polands-consumer-protection-watchdog)
- **30-day prior-price rule:** Art. 6a(2) of the Price Indication Directive (inserted by the Omnibus Directive) defines the prior price as the lowest price applied in at least the 30 days before the reduction, and Art. 6a(1) requires every reduction announcement to show it. The CJEU confirmed the strict reading in *Aldi Süd* (C‑330/23, 26 Sept 2024) — [Herbert Smith Freehills Kramer](https://www.hsfkramer.com/notes/ip/2024-posts/cjeu-confirms-that-price-reduction-claims-must-be-based-on-lowest-price-in-last-30-days); [RPC on Commission guidance](https://rpclegal.com/snapshots/consumer/spring-2022/european-commission-publishes-guidance-on-price-promotions-under-the-omnibus-directive)
- Per the Commission guidance, general announcements that create an impression of a discount must still reflect the 30-day low, though it can be shown per item. Long-term arrangements (e.g. loyalty pricing) and individual reductions are outside Art. 6a. The guidance is non-binding — [RPC](https://rpclegal.com/snapshots/consumer/spring-2022/european-commission-publishes-guidance-on-price-promotions-under-the-omnibus-directive); [Bird & Bird on German §11 PAngV (2026)](https://cm.twobirds.com/en/insights/2026/germany/price-transparency-in-retail-what-companies-need-to-know-about-section-11-of-the-german-price-indica)
- **DSA Art. 25:** "Providers of online platforms shall not design, organise or operate their online interfaces in a way that deceives or manipulates the recipients of their service or … materially distorts or impairs" their free and informed decisions. Practices already covered by the UCPD or GDPR are excluded (Art. 25(2)). The Commission may give guidance on prominence of choices, repeated nagging, and cancellation that is harder than sign-up (Art. 25(3)). Most obligations applied from 17 Feb 2024 — [Springlex DSA Art. 25 (OJ L 277)](https://www.springlex.eu/en/packages/dsa/dsa-regulation/article-25/); [William Fry](https://www.williamfry.com/knowledge/dark-patterns-not-a-new-concept-but-will-now-be-heavily-regulated/); [Taylor Wessing](https://www.taylorwessing.com/de/insights-and-events/insights/2022/12/what-is-a-dark-pattern)
- **Digital Fairness Act:** the consultation and fitness check identified countdown timers, leading choice presentation, misleading questions, addictive design, unfair personalisation and in-game currencies as targets. Commentators expect the proposal to be tabled around Q4 2026. No adopted text was found — [Osborne Clarke, DFA Unpacked: Dark Patterns](https://www.osborneclarke.com/insights/digital-fairness-act-unpacked-dark-patterns); [Bird & Bird, consultation](https://www.twobirds.com/en/insights/2025/eu-–-consultation-on-the-digital-fairness-act); [A&L Goodbody](https://www.algoodbody.com/insights-publications/digital-fairness-act-a-necessary-safeguard-or-unnecessary-duplication)
- Pay-what-you-want with a zero minimum is an established, non-coercive offer model (itch.io, Gumroad); see section 1 — [itch.io docs](https://itch.io/docs); [Gumroad Help](https://gumroad.com/help/article/133-pay-what-you-want-pricing)

### Inferences
- Any countdown djmanzo shows must count to a real, server-enforced end. It must never reset per visitor, and the price must actually revert. Showing the exact end date and time in words alongside the timer is safer and kinder than a ticking clock alone.
- Every "−X%" or struck-through price must use the lowest price of the past 30 days as the reference. The simplest compliant design shows "Lowest price in last 30 days: €N" next to the offer. Launch-price offers for a new product are a recognised exception area, but they should still be labelled honestly.
- Avoid confirmshaming ("No thanks, I hate saving money"), pre-ticked add-ons, and nagging pop-ups that reappear after dismissal. All are named targets of Art. 25(3) and the DFA.
- Student, regional and loyalty prices are framed as standing price tiers rather than "reductions", which keeps them out of Art. 6a. This is per the guidance's carve-out for long-term arrangements, and should be confirmed with counsel.
- Seasonal offers can borrow the event staging from section 4 (a decorated plaza, a keepsake) without urgency mechanics. The event itself is the reason to visit, not fear of missing out.

### Gaps
- The Commission's 2021 UCPD guidance notice (2021/C 526/01) and the Price Indication guidance (2021/C 526/02) were not fetched directly. The findings rely on law-firm and academic summaries.
- No sourced findings on regional pricing (purchasing-power parity) practice, student-discount verification, bundles or launch-offer case studies.
- The DFA's tabling status as of October 2026 could not be confirmed. Sources predate it or speculate on timing.

## 6. Moderation and safety for a small EU host (DSA notice-and-action) as it affects UX

### Takeaway
Every hosting service, however small, must give users an easy electronic way to report illegal content (DSA Art. 16) and must tell reporters and uploaders what was decided. Micro and small enterprises are spared the heavier online-platform duties (Arts. 19–28: internal complaint system, trusted flaggers and others) and the transparency-report duty. In UX terms, djmanzo needs a "Report" control on every item, post and creator page, and a simple decision and reasons notice. A full appeals bureaucracy is not required.

### Cited Findings
- Article 16 applies to all hosting providers regardless of size. A notice should include a substantiated explanation, the exact URL, the notifier's name and email, and a good-faith statement. A sufficiently precise notice creates "actual knowledge" for the Art. 6 hosting safe harbour. Providers must process notices diligently and objectively and inform the notifier of the decision and redress — [Presencis: DSA Article 16](https://presencis.com/regulations/dsa/article-16/); [Doctena DSA page](https://trust.doctena.com/dsa)
- Micro and small enterprises (fewer than 50 staff and no more than €10M turnover, per Recommendation 2003/361/EC) are exempt from the online-platform obligations in Arts. 19–28 (including internal complaint handling, out-of-court dispute settlement and trusted flaggers) and from the Art. 15 transparency report — [sota.io DSA guide](https://sota.io/blog/eu-digital-services-act-2024-hosting-provider-developer-guide); [serverdiscounter DSA page](https://serverdiscounter.com/en/dsa); [Taylor Wessing overview](https://www.taylorwessing.com/de/interface/2022/the-eus-digital-services-act/digital-services-act---an-overview)
- Conflict: one guide claims small providers get a "simplified" Art. 16 duty, but other sources do not support this. Another misnumbers the transparency report as Art. 13. Doctena's scope statement is internally inconsistent — [Presencis applicability FAQ](https://cdn.presencis.com/regulations/dsa/applicability/) (noted for caution)
- Presencis lists Art. 25 as applying to all online platforms *except* micro and small enterprises. That exemption sits in Art. 19, so verify against the Official Journal text. If the site is a micro enterprise, Art. 25 may not bind it, but UCPD dark-pattern rules still do — [Presencis: DSA Article 25](https://presencis.com/regulations/dsa/article-25/)
- Precedents in creative marketplaces include abuse reports visible only to moderators (Blender) and forced uninstall or block of removed malicious extensions (VS Code) — [Blender extensions-website repo](https://projects.blender.org/infrastructure/extensions-website/src/tag/20240404-143833); [Microsoft Developer Blog](https://developer.microsoft.com/blog/security-and-trust-in-visual-studio-marketplace/)

### Inferences
- UX checklist for djmanzo. These come from the cited Art. 16 elements, not from legal advice:
  1. A "Report" button on every marketplace item, review, forum post and profile.
  2. A short form with reason, URL (prefilled), optional name and email, and a good-faith tick box.
  3. An acknowledgement, then a decision message to the reporter.
  4. A "why this was removed" notice to the uploader with the reason (a statement of reasons).
  5. Reports visible only to moderators.
- Because the site hosts downloadable files, the moderation flow should support "hide pending review" and "remove and notify downloaders". The latter is a lighter version of VS Code's block-on-removal.
- Staying data-only for skins and visuals (no executable code) sharply reduces the safety surface. That is an inference, consistent with Blender's no-remote-code rule.

### Gaps
- The Art. 17 (statement of reasons) obligations and their exact applicability to micro hosts were not verified against the Official Journal.
- No source was found on DSA notice-and-action UX case studies at small community sites.

### Consolidated design takeaways for djmanzo (inference, drawing on all sections above)
1. **Marketplace as a market square.** Each creator gets a "stall" (creator page) on the island plaza. Each item shows a live preview (skin on a mock deck, visual playing) before download, a trust scorecard (reviewed, data-only checks passed, licence, updated date), "remixed from" lineage, one "Support this creator" link out, and a "Talk about it" forum thread. Reviews are kept separate from bug reports.
2. **Forum with gentle trust levels.** Unlock posting by reading. Publish a friendly "why can't I do X yet?" page. Let regulars hide obvious spam instantly. Keep new-user link and image limits, which matter given external donation links.
3. **Wishlist with honest statuses.** Use Under review → Planned → Building → Shipped (linked to a release note) → Not planned (with a reason). Default to "new" or "trending" sort. Ask for the problem, not the solution. Hold a seasonal "You asked, we built" wall.
4. **Seasonal events, not pressure.** Hold a predictable calendar of a few events a year that redecorate the central plaza, with a free keepsake (seasonal skin or sticker) for visiting. Use collect-and-browse mechanics, avoid competitive team games, and give community-hosted showcases a slot.
5. **Offers that are honestly urgent.** Real end dates written in words and enforced by the server. No resetting timers. Show the 30-day lowest price beside any discount. Frame student and regional prices as standing tiers. No confirmshaming, pre-ticked extras or recurring nag modals.
6. **DSA basics in the UI.** A report control everywhere, an acknowledgement and decision sent to the reporter, a reasons notice to the uploader, and moderator-only report visibility.
