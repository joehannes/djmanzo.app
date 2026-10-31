/**
 * Vietnamese words for the features (shared/facts.ts): fetched only when
 * Vietnamese is chosen. Bạn for the reader, the booth's English words as
 * Vietnamese DJs say them; djmanzo's own interface labels stay as the
 * application shows them.
 */

import type { FactWords } from "../factwords";

const w: FactWords = {
  status: "djmanzo đang ở bản beta: một ứng dụng DJ hoàn chỉnh cho Windows, macOS và Linux, được kiểm thử trong kho mã của chính nó — với thiết bị giả lập ở những chỗ không có phần cứng — và chưa qua một buổi diễn thật nào.",
  soon: { almost: "Sắp xong", progress: "Đang làm", planned: "Đã lên kế hoạch" },
  areas: {
    mixing: { name: "Mix nhạc", about: "Deck, mixer, cue, loop, hiệu ứng và stem." },
    library: { name: "Thư viện", about: "Những bản nhạc của bạn, được đọc, sắp xếp và tìm thấy." },
    hands: { name: "Phím, controller và màn hình", about: "Bàn phím, phím dễ nhớ, controller, đĩa vinyl và các màn hình bạn làm việc." },
    karaoke: { name: "Karaoke", about: "Mọi thứ người dẫn karaoke cần, từ hàng chờ đến bài hát làm riêng cho một vị khách." },
    assist: { name: "Trợ lý và chế độ lái tự động", about: "Gợi ý có nói lý do, một bản mix tự chạy, và giành lại quyền điều khiển bất cứ lúc nào." },
    learn: { name: "Học", about: "Người thầy, khóa học và kiến thức." },
    show: { name: "Buổi diễn", about: "Video, hình ảnh, ánh sáng, phát trực tiếp, khán phòng và đêm diễn." },
    look: { name: "Giao diện và gói", about: "Chủ đề, skin, xưởng giao diện và marketplace." },
    editions: { name: "Phiên bản, nền tảng và tình trạng", about: "Cái gì chạy ở đâu, giá bao nhiêu, và cái gì chưa được chứng minh." },
  },
  facts: {
    decks: {
      name: "Hai deck và mixer",
      about: "Play, cue, sync, keylock, pitch fader có dải chỉnh từ ±6 đến ±100 %, fader kênh và crossfader với gán A / thru / B cùng đường cong mượt, tuyến tính hoặc gắt, EQ ba dải có kill, filter, gain từ phân tích độ lớn âm thanh, cue tai nghe, đầu ra booth và limiter.",
      scene: "Thứ Sáu, 11 giờ đêm, mở màn: hai bản nhạc, một fader và đôi tai của bạn. Mọi thứ khác trên trang này đều xây trên hai deck này.",
    },
    transport: {
      name: "Slip, reverse, brake, backspin và deck nhân bản",
      about: "Các động tác trình diễn ngay trên deck, có quantize và beat jump; và một bản sao tức thì: cùng bản nhạc trên deck kia, cùng vị trí, tốc độ, tông và grid — cùng các mẫu âm, không phải nạp lại.",
    },
    pads: {
      name: "Cue, loop và pad",
      about: "Tám hot cue có tên và màu (nhập từ Serato và rekordbox, hoặc đặt bằng Shift+chuột phải), loop theo số phách, loop roll tới 1/16, slicer, và các trang pad cho cue, loop, roll, loop đã lưu, sampler và hiệu ứng.",
      scene: "Đoạn vocal bạn cần nằm ở ô nhịp thứ 32. Một hot cue có tên, có màu đưa bạn tới đó chỉ bằng một lần bấm, sàn nhảy không hề hay biết.",
    },
    fx: {
      name: "Dàn hiệu ứng",
      about: "Echo, delay, reverb, gate, crush, flanger, phaser và filter — đồng bộ theo phách, ba ô cho mỗi deck và cho master, kèm preset chuỗi hiệu ứng.",
      scene: "Drop đến muộn; một cú echo out ở phách cuối của câu nhạc cho bạn đủ bốn ô nhịp cần thiết.",
    },
    sampler: { name: "Sampler", about: "Các bank pad — one-shot, loop, hold, stutter — đồng bộ với tempo master, và thu từ một deck." },
    record: { name: "Thu master", about: "Cả set ra ổ đĩa, dưới dạng WAV." },
    library: {
      name: "Thư viện",
      about: "Thư mục, playlist, crate và thư mục thông minh; nhập từ rekordbox, Traktor và iTunes cùng cue và grid, từ Serato cùng crate, hot cue và loop; tìm bản trùng; tìm kiếm tức thì; cả bộ sưu tập dưới dạng thẻ với ảnh bìa riêng.",
      scene: "Bạn chuyển từ rekordbox vào thứ Ba; đến thứ Bảy, cue, grid và crate đã nằm đúng chỗ tay bạn quen tìm.",
    },
    camelot: {
      name: "Tông và tempo, được đọc sẵn",
      about: "BPM, tông trên bánh xe Camelot cùng các tông hợp nhau, độ lớn âm thanh, và 31 họ thể loại khắp Mỹ Latinh, Bắc Mỹ, châu Âu, châu Phi và xa hơn.",
      scene: "8A sang 9A: bánh xe bảo sẽ khớp, trước khi sàn nhảy phải tự phát hiện.",
    },
    waveforms: {
      name: "Dạng sóng vẽ bằng Rust",
      about: "Dạng sóng cuộn và tổng quan với beat grid chỉnh được, lớp hiển thị cue và loop, tô màu theo dải tần, được kết xuất bằng Rust để vẫn nhanh trên Linux.",
    },
    phrases: {
      name: "Câu nhạc, intro và outro",
      about: "Độ dài câu nhạc và điểm neo được tìm trong bản nhạc và đánh dấu trên dạng sóng, với loop và nhảy khóa theo câu nhạc; build, drop, breakdown và chỗ vocal vào; và nơi nhạc bắt đầu, kết thúc, để automix rời bản nhạc đúng chỗ phần nhạc hết.",
      caveat: "Đã kiểm chứng với các track tổng hợp, chưa đo trên một tập bản nhạc thật. Tiếng vỗ tay trong bản thu trực tiếp bị đọc thành nhạc.",
      scene: "Mix theo câu nhạc, không theo phỏng đoán: 16 ô nhịp tiếp theo đã được đánh dấu trước khi tới.",
    },
    find: {
      name: "Tìm theo trí nhớ",
      about: "Một câu hát nhớ được một nửa, một lời mô tả, hay một giai điệu ngân nga.",
      caveat: "Ngân nga chưa từng được thử với micro thật, và chỉ tìm được những bản đã có trong bộ sưu tập; chỉ lời mô tả mới gọi tên được bản bạn không có.",
      scene: "«Cái bài đa-đa-đaa... có kèn ấy»: ngân nga lên, và bản nhạc hiện ra.",
    },
    keyboard: {
      name: "Bàn phím là một controller",
      about: "Cùng từ vựng và định dạng tệp với một mapping MIDI, nên chiếc laptop không cắm gì vẫn là một nhạc cụ chơi được.",
      scene: "Để quên controller trong xe: phím laptop chơi cả set, cùng định dạng mapping mà controller dùng.",
    },
    mapped: {
      name: "Controller với mapping có sẵn",
      about: "Mapping viết từ bảng MIDI của chính từng hãng, kể cả núm duyệt và nút nạp: dòng DDJ-400 và FLX4 của Pioneer, DDJ-200, DDJ-SR và CDJ-3000 (ở chế độ HID), Denon MC4000, Hercules Inpulse 300, Numark DJ2GO, Reloop Mixon 4, phần deck của Roland DJ-707M và Launchpad Mini MK3 làm lưới pad, cùng một mapping hai deck chung.",
      caveat: "Chưa cái nào được chơi trên chính thiết bị: tất cả chạy với thiết bị giả lập. Nhiều controller không công bố bảng và đang chờ chế độ learn.",
    },
    themes: {
      name: "Chủ đề và skin",
      about: "Bảng màu, trong đó có bốn chủ đề Caribe, với các lớp hình ảnh bên trên; bảng điều khiển có thể di chuyển, phóng to và tách ra cửa sổ riêng.",
    },
    layouts: { name: "Bố cục", about: "Starter, Essentials, Pro, Performance, Scratch và Stem Performance, cùng bố cục riêng của DJ dưới dạng tệp không thể chạy mã." },
    requests: { name: "Yêu cầu từ khán phòng", about: "Khán giả xin bài qua mã QR — không phải cài ứng dụng — và DJ đọc danh sách từ bài được xin nhiều nhất." },
    share: { name: "Chia sẻ một set", about: "Tracklist đêm nay được chuyển sang WhatsApp, X, Bluesky hoặc Threads với tin nhắn đã viết sẵn; DJ chỉ việc bấm gửi." },
    linux: {
      name: "Linux và macOS",
      about: "Trên Linux, âm thanh đi qua thiết bị mặc định của ALSA, do PipeWire phục vụ; Windows, macOS và Linux là các nền tảng được phát hành.",
      caveat: "Chưa thể chọn JACK làm máy chủ âm thanh, và CI chạy trên Ubuntu chứ không phải Xubuntu.",
    },
    decks6: { name: "Bốn đến sáu deck", about: "Deck ba và bốn, và lên tới sáu." },
    stems: {
      name: "Stem trực tiếp",
      about: "Vocal, trống, bass và phần còn lại tách riêng, được tách trước đầu phát vào bộ đệm nên âm thanh không bị trễ; EQ cho từng stem, và vocal của deck này trên bản mix của deck kia.",
      scene: "Một vị khách muốn bản acapella của bài bạn chỉ có bản đầy đủ. Tắt hết trừ vocal, trực tiếp, không một tiếng click.",
    },
    automix: {
      name: "Automix và chế độ lái tự động",
      about: "Ứng dụng tự chạy bản mix từ một set đã soạn, theo sáu kiểu, và nhường lại ngay khi có bàn tay chạm vào nút điều khiển.",
      caveat: "Chưa từng được kiểm chứng với âm thanh thật: máy phát triển không có thiết bị đầu ra.",
      scene: "Giờ ăn tối của tiệc cưới: chế độ lái tự động phát mạch nhạc bạn đặt trong lúc bạn trò chuyện với cô dâu chú rể, và trả deck lại ngay khi bạn chạm vào một chiếc.",
    },
    "autopilot-surface": {
      name: "Bảng Auto-Pilot",
      about: "Định hình đêm theo dáng, độ dài, dải tempo, thời kỳ và các thể loại bạn thích hay muốn bỏ; lấp đầy từ bộ sưu tập, bắt đầu, giành quyền, trao lại, lưu thành playlist.",
      caveat: "Chỉ lấp đầy từ bộ sưu tập của chính bạn. Lấp đầy từ nguồn trực tuyến, và tự tay vẽ năng lượng của đêm thay vì chọn một trong bốn dáng, vẫn đang trên đường tới.",
    },
    suggest: {
      name: "Phát gì tiếp theo, và vì sao",
      about: "Gợi ý bài tiếp theo xếp hạng theo tông, tempo, độ lớn âm thanh và câu nhạc, mỗi bài kèm lý do; và một bộ lập kế hoạch chuyển bài đề xuất ở đâu và thế nào.",
      caveat: "Năng lượng được ước lượng bằng độ lớn âm thanh. Bộ lập kế hoạch không thể biết outro ở đâu: ranh giới câu nhạc gần cuối là phỏng đoán.",
      scene: "Bài này còn hai phút mà chưa nạp gì: danh sách cho biết ba bài nào sẽ tiếp đất êm, và vì sao từng bài.",
    },
    asks: {
      name: "Hỏi trước khi làm",
      about: "Trợ lý chuẩn bị cả một màn chuyển bài như một thứ để bạn chấp nhận, sửa hoặc từ chối, và chỉ nói bằng những thao tác mà một DJ có thể tự bấm.",
    },
    packs: { name: "Gói kiến thức và hướng dẫn", about: "Dáng của một thể loại hay một đêm dành cho trợ lý, và hướng dẫn cho từng chủ đề." },
    teacher: {
      name: "Người thầy",
      about: "Phòng tập và một deck luyện tập chỉ tai nghe nghe thấy, huấn luyện viên gọi tên điều đôi tay vừa làm, hai mươi tám kỹ thuật và một bài kiểm tra.",
      scene: "Chiều Chủ nhật, đeo tai nghe: huấn luyện viên bảo đó là một cú bass swap, sớm hai phách.",
    },
    curriculum: {
      name: "Khóa Apprentice",
      about: "Mười chặng theo thứ tự, từ deck và beatmatching đến buổi diễn đầu tiên và con đường phía trước: hai mươi ba bài học, bài về thể loại được viết từ gói kiến thức của bạn. Huấn luyện viên kiểm tra từng động tác từ những gì bạn vừa chơi; beatmatching bằng tai được kiểm tra từ hai tempo, và SYNC không được tính. Tiến độ của bạn được lưu lại.",
      caveat: "Hiện có hai mươi ba bài; còn nữa sẽ đến, và chủ dự án vẫn phải duyệt nội dung từng bài.",
      scene: "Từ lần beatmatch đầu tiên đến buổi diễn đầu tiên, theo thứ tự, có huấn luyện viên kiểm tra điều bạn thực sự làm.",
    },
    karaoke: {
      name: "Một đêm karaoke",
      about: "Màn hình cho người hát với lời chạy đúng nhịp, hàng chờ và trang đăng ký, bỏ giọng ca, micro và hiệu ứng riêng cho từng người hát, song ca, giọng dẫn, nhạc giải lao, hát có chấm điểm, câu đố, và tìm bài mà người hát không nhớ tên.",
      caveat: "Vẫn đang tới: phần song ca và điện thoại làm micro.",
      waits: "Phần song ca chờ một mô hình tách nhạc có giấy phép djmanzo dùng được; điện thoại làm micro chờ một kết nối nội bộ an toàn.",
      scene: "Karaoke ở quán bar lúc mười giờ: mã QR trên bàn, hàng chờ trên màn hình, lời chạy đúng nhịp, và giọng ca đã biến khỏi bản nhạc.",
    },
    oldmac: {
      name: "djmanzo trên máy Mac cũ",
      about: "Toàn bộ ứng dụng, mở thẳng vào karaoke, cho Mac Intel tới macOS 10.13.",
      caveat: "Chưa ai chạy nó trên một chiếc Mac đời 2011. Canh thời gian lời bằng cách nghe và lệnh giọng nói cần macOS 10.15 trở lên.",
    },
    room: {
      name: "Đọc khán phòng",
      about: "Một camera và một micro cho biết sàn nhảy đang lắng hơn hay sôi hơn lúc nãy; phản ứng của khán giả từ điện thoại họ; mỗi bản mix đã làm gì — mỗi điều kèm mức độ chắc chắn.",
      caveat: "Phần đo chưa từng chạy với camera thật. Không hình ảnh nào được ghi, lưu hay gửi đi.",
      scene: "Có ăn không? Sàn nhảy đông hơn hai mươi phút trước, và màn hình nói vậy, kèm mức độ chắc chắn.",
    },
    mapping: {
      name: "Map bất kỳ controller nào",
      about: "Bấm một nút, chọn chức năng, lưu; thiết bị HID, đèn, Lua cho những gì bảng không diễn tả được, và giao diện tự đọc thứ đang được cắm.",
      caveat: "Chưa thử trên phần cứng: chạy với thiết bị giả lập và chưa gặp chính thiết bị.",
      scene: "Một controller chưa ai viết mapping: bấm một núm, chọn nó làm gì, giữ lại.",
    },
    platters: {
      name: "Mâm xoay có động cơ",
      about: "Vị trí tuyệt đối của mâm xoay, động cơ chạy theo transport.",
      caveat: "Chưa thử trên phần cứng: chạy với thiết bị giả lập và chưa gặp chính thiết bị.",
    },
    dvs: {
      name: "Vinyl timecode",
      about: "Bàn xoay thật điều khiển một deck, tương đối hoặc tuyệt đối; djmanzo tự viết tín hiệu điều khiển, nên không cần đĩa có bản quyền.",
      caveat: "Chưa chạy với một đĩa ép thật.",
      scene: "Bàn xoay của bạn, đôi tay của bạn, bất kỳ đĩa nào trên deck: djmanzo tự viết timecode.",
    },
    visuals: {
      name: "Video và hình ảnh",
      about: "Video trên deck, hình chuyển cảnh theo âm thanh, các lớp hình WebGL và preset MilkDrop — cả preset riêng của DJ — cho máy chiếu hoặc màn hình thứ hai.",
      caveat: "Trên Linux, video H.264 chỉ phát khi đã cài gstreamer1.0-libav của bản phân phối; đến nay video mới chỉ chạy trên Linux.",
      scene: "Máy chiếu sau booth chiếu video ca nhạc khớp với bản mix, hoặc một hình ảnh thở theo tiếng bass.",
    },
    live: {
      name: "Phát trực tiếp",
      about: "Bài đang phát trên luồng: một lớp phủ cho OBS và một tệp văn bản, cho Twitch, YouTube, Instagram, TikTok hoặc Kick.",
      scene: "Đang phát set: OBS hiện tên bài mỗi khi đổi, chẳng ai phải gõ.",
    },
    outputs: {
      name: "Xuất stem",
      about: "Stem của một deck thành bốn cặp stereo — vocal, trống, bass, phần còn lại — để xử lý bên ngoài.",
      caveat: "Chưa thử trên phần cứng: chạy với thiết bị giả lập và chưa gặp chính thiết bị.",
    },
    deckouts: {
      name: "Xuất deck",
      about: "Mỗi deck trên cặp stereo riêng, trước fader, cho một mixer bên ngoài.",
      caveat: "Chưa thử trên phần cứng: chạy với thiết bị giả lập và chưa gặp chính thiết bị.",
    },
    clap: { name: "Plugin CLAP", about: "Plugin âm thanh gắn trên master, với nút điều khiển chung và không có cửa sổ plugin." },
    sources: {
      name: "Nguồn trực tuyến",
      about: "Tìm trên Spotify, YouTube, Jamendo và Internet Archive, rồi khớp kết quả với tệp bạn đã có. Để tìm và lên kế hoạch: họ không cho phép mix âm thanh của Spotify hay YouTube Music.",
    },
    events: {
      name: "Sự kiện và bộ hồ sơ báo chí",
      about: "Một lịch diễn theo dõi từng bước, kế hoạch của đêm diễn, và bộ hồ sơ báo chí.",
      scene: "Một lịch diễn tháng Ba: kế hoạch, tờ thông tin cho địa điểm, hồ sơ báo chí, tất cả ở đúng chỗ bạn để.",
    },
    replay: {
      name: "Phát lại",
      about: "Một set là dữ liệu: nghe lại, kết xuất lại một bản mix từ bảng Mixes, lặp một màn chuyển bài để tập, so sánh hai lần chơi.",
      caveat: "Kết xuất lại cả set ngoại tuyến là một lệnh chưa có nút bấm. Đầu vào trực tiếp — micro, aux, timecode — không thể tái tạo, và điều đó được nói rõ.",
      waits: "Một nút để kết xuất lại cả set ngoại tuyến.",
    },
    api: {
      name: "Một bề mặt mở",
      about: "API điều khiển qua OSC và JSON theo dòng trên TCP, bằng chính các thao tác giao diện dùng; MIDI clock vào và ra; và đồng bộ tempo giữa các máy djmanzo (không phải Ableton Link).",
    },
    editions: {
      name: "Bảy phiên bản, một lần tải",
      about: "Auto-Pilot, Hobbyist, Apprentice, Karaoke, Pro DJ, Full và Custom, tất cả là một ứng dụng, mở khóa bằng đăng nhập. Mỗi phiên bản chỉ hiện những gì nó có; thứ còn thiếu là một tấm thẻ lặng lẽ ghi tên phiên bản có nó.",
      caveat: "Đăng nhập từ djmanzo sẽ tới cửa hàng này khi có một bản phát hành được build để gọi tên nó, và đó là bước của chủ dự án. Đến lúc đó djmanzo không từ chối gì; sau đó, djmanzo không có giấy phép là phiên bản Hobbyist miễn phí.",
      waits: "Đã xây trong djmanzo và chạy ở đây ở chế độ demo; mua hàng mở ngay khi thanh toán và đăng nhập thật được bật.",
    },
    trial: {
      name: "Bảy ngày với bất kỳ phiên bản nào",
      about: "Dùng thử miễn phí bất kỳ phiên bản nào, kể cả Full, một lần cho mỗi tài khoản. Nếu kết thúc mà không mua, djmanzo trở thành phiên bản Hobbyist, miễn phí, mãi mãi: những gì bản dùng thử thêm vào hiện thành thẻ lặng lẽ, và không gì bạn đã làm bị mất.",
      caveat: "Bắt đầu ở đây, hoặc trong djmanzo từ Settings → Licence khi có bản phát hành gọi tên cửa hàng này; số ngày còn lại hiện trên thanh trạng thái của djmanzo.",
      waits: "Dùng thử bắt đầu được ngay khi đăng nhập thật được bật.",
    },
    marketplace: {
      name: "Marketplace",
      about: "Các gói miễn phí do DJ làm, có chữ ký của người làm: chủ đề, skin, hình ảnh, kỹ thuật DJ mà chế độ lái tự động trình diễn, bộ phím, mapping controller, gói kiến thức và bài học gia nhập khóa học ở đúng chặng. Bảng Marketplace của djmanzo cho duyệt theo loại và thể loại, có hình và giấy phép trên mỗi thẻ, và cài hay gỡ chỉ với một lần bấm; trang này cũng liệt kê chúng, với bảy bộ phím của đội ngũ để bắt đầu.",
      caveat: "Màn hình karaoke và plugin dạng gói vẫn đang tới. Trang này hiện liệt kê chủ đề, skin, hình ảnh và bộ phím; các loại khác cài trong djmanzo từ tệp hoặc chỉ mục.",
      waits: "Đã có tám loại; tiếp theo là màn hình karaoke, plugin âm thanh và hàng chờ duyệt.",
    },
    setplan: { name: "Kế hoạch set", about: "Đêm diễn được lên kế hoạch như một mạch, chỉnh hướng mà không phải dựng lại." },
    "hobbyist-free": {
      name: "Phiên bản Hobbyist, miễn phí mãi mãi",
      about: "Hai deck, mixer, thư viện, cue, loop và pad, hiệu ứng, sampler, thu âm, bàn phím và một controller, không phải mua gì. Đó là nơi bản dùng thử dừng lại: những gì bản dùng thử thêm vào hiện thành thẻ lặng lẽ, và không gì bạn đã làm bị mất.",
      caveat: "Khi cửa hàng mở trong djmanzo; đến lúc đó djmanzo không từ chối gì.",
      waits: "Tải miễn phí ngay hôm nay; đăng nhập vào đó mở cùng cửa hàng.",
    },
    "quiet-cards": {
      name: "Một cái nhìn về những gì còn có",
      about: "Ở mọi phiên bản trừ Full, bảng điều khiển mà phiên bản không có được vẽ thành một thẻ lặng lẽ: nó làm gì và phiên bản rẻ nhất có nó. Không bao giờ là nút hỏng, không bao giờ là cửa sổ bật lên, không bao giờ khi bạn đang mix.",
      caveat: "Các nút bên trong một bảng, như nút stem trên deck của Hobbyist, được bỏ đi thay vì hiện thành thẻ.",
    },
    "look-studio": {
      name: "Xưởng giao diện",
      about: "Bấm ghép một chủ đề cùng skin từ tám điểm khởi đầu, mười sáu bảng màu hoặc ba màu bất kỳ, tám phong cách và mười hai họa tiết, khoác lên cả cửa sổ trong lúc làm; hoặc nhờ AI bất kỳ làm từ một mẫu bạn sao chép. Mọi chủ đề đều giữ được độ tương phản WCAG để dễ đọc. Giữ nó thành gói ký bằng khóa của bạn, hoặc chia sẻ dưới dạng .djpack.",
      caveat: "Làm bằng nhà cung cấp AI của riêng bạn trong djmanzo cần đến trợ lý; sao chép mẫu sang AI bất kỳ thì dùng được ở mọi phiên bản. Hình ảnh cho máy chiếu và karaoke chưa thuộc thiết kế.",
    },
    "theme-packs": {
      name: "Chủ đề và skin dạng gói",
      about: "Một chủ đề (mười bốn màu cho phòng tối và phòng sáng, mọi cặp bạn đọc đều giữ độ tương phản) hoặc một skin (ô SVG chỉ biết vẽ, đứng yên, trôi hoặc thở theo bass) được cài dưới dạng .djpack có chữ ký từ Settings, ở mọi phiên bản, và khoác lên như của chính djmanzo.",
    },
    hardware: {
      name: "Thêm phần cứng",
      about: "Mapping cho thêm nhiều controller mà mọi người đang có — các DDJ lớn hơn của Pioneer, Hercules Inpulse 500, Traktor Kontrol S2 và S4, Denon và Rane, thêm Reloop — mỗi cái từ bảng của hãng hoặc từ thiết bị trong tay, và điện thoại làm điều khiển từ xa.",
      waits: "Bảng MIDI mà từng hãng công bố, hoặc thiết bị trong tay.",
    },
    club: {
      name: "Đầu phát club và thêm ánh sáng",
      about: "Pro DJ Link, StagelinQ, Ableton Link, giao diện USB DMX, đèn moving head và nhiều hơn một universe, MIDI 2.0.",
      caveat: "Không cái nào được chứng minh cho tới khi gặp thiết bị thật.",
      waits: "Một đầu phát thật để thử, và một giấy phép Ableton Link mà djmanzo dùng được.",
    },
    windows: {
      name: "Windows",
      about: "Được build, kiểm thử trong CI và đóng gói ở mọi bản phát hành, và chủ của djmanzo đã chạy nó trên một máy Windows.",
      caveat: "Vẫn là beta, như mọi thứ ở đây: đến nay mới có một người dùng thử trên Windows.",
    },
    gig: {
      name: "Một buổi diễn thật",
      about: "Mọi thứ ở đây đã được kiểm thử trong kho mã; chưa cái nào trước khán giả.",
      waits: "Một đêm có khán giả, và những gì nó phát hiện được ghi lại.",
    },
    leader: {
      name: "Phím dễ nhớ dưới Space",
      about: "Bấm Space và một bảng hướng dẫn hiện mọi phím: những chuỗi đọc như chữ — Space d 1 p là deck 1 play, Space o i mở danh sách người hát. Đặt phím của riêng bạn lên trên phím của djmanzo, và khoác thêm một bộ phím làm cho một mục đích.",
      scene: "Space, d, 1, p: deck một phát nhạc. Đọc như chữ là nhớ.",
    },
    keysets: {
      name: "Bộ phím",
      about: "Bố cục dễ nhớ cho một cách làm việc: chín bộ đi kèm djmanzo — mỗi bộ cho cách làm việc của một phiên bản (Essentials, Learning, Karaoke host, Performance, Autopilot, Dashboards) cùng Scratch, Open format và One hand — và còn nhiều bộ nữa dưới dạng gói trên marketplace. Một bộ thêm phím vào những chữ djmanzo để trống, nằm dưới phím của bạn, nên khoác vào không bao giờ lấy mất phím nào; phím riêng của bạn có thể lưu thành bộ, hoặc xuất bản kèm tên và liên kết ủng hộ chỉ với một lần bấm.",
      caveat: "Mỗi lúc chỉ khoác một bộ.",
    },
    launcher: {
      name: "Trình khởi chạy và các bảng",
      about: "Bấm 0 để mở trình khởi chạy: những màn hình trọn vẹn thay cho deck — bảng Karaoke đặt người hát và nhạc của bạn cạnh nhau, deck thu gọn, Karaoke prep cho một giờ trước đó — và những bảng của riêng bạn, tự tay sắp xếp.",
    },
    palette: {
      name: "Một ô tìm cho mọi thứ",
      about: "Bảng lệnh (Ctrl hoặc Cmd + K) tìm bất kỳ bản nhạc, bảng điều khiển, preset, chủ đề hay thao tác nào, chịu được gõ sai; mọi bảng có thể tách ra cửa sổ riêng và vẫn hoạt động.",
    },
    deckqueue: {
      name: "Một playlist dưới mỗi deck",
      about: "Mỗi deck có ngăn playlist riêng: bấm một lần để nạp bài, ▶ để nạp và phát, và với Next when this ends cùng Repeat nó tự chạy tiếp, hết vòng lại vòng, xáo trộn nếu muốn — một deck độn với jingle và loop trong khi deck kia làm việc chính.",
      scene: "Giữa các lượt hát karaoke, deck kia một mình giữ không khí, jingle và loop hết vòng lại vòng.",
    },
    "current-deck": {
      name: "Một deck hiện hành, hai kiểu thiết kế, và một deck nổi",
      about: "Luôn có một deck hiện hành được viền lại; các phím tác động lên nó, và Tab, một lần bấm hay một chạm trên controller sẽ chuyển nó. Mỗi deck có bản đầy đủ hoặc gọn — bản gọn giữ dạng sóng, transport, âm lượng và filter, mở EQ, pad, loop và hiệu ứng ngay tại chỗ — và deck nào cũng có thể nổi lên, đủ kích thước, trên các deck khác. Sáu deck vừa một màn hình laptop.",
      scene: "Bốn deck trên laptop 13 inch ở một quán bar sân thượng: deck gọn, mọi fader trên màn hình, deck bạn sắp chạm được viền lại.",
    },
    "context-rail": {
      name: "Thanh ngữ cảnh",
      about: "Những gì đang bật trên mỗi deck — một loop, một hiệu ứng, một filter, một stem bị tắt — liệt kê ngay bên cạnh, mỗi thứ một lần bấm là về trạng thái gốc.",
      scene: "Giữa một màn blend dài mà vẫn còn gì đó đang bật: thanh cho thấy echo trên deck 2, và một lần bấm là tắt.",
    },
    "booth-moves": {
      name: "Nhân bản deck, dải pitch, đường cong crossfader, intro và outro",
      about: "Một bản sao tức thì của bài đang phát sang deck khác; dải pitch từ ±6 đến ±100 %; crossfader mượt, tuyến tính hoặc gắt; hot cue có tên và màu; và nơi phần nhạc của từng bài bắt đầu và kết thúc, do phân tích tìm ra.",
      scene: "Một màn beat juggle cần cùng một bài hai lần: nhân bản nó, và cả hai bản đều khớp nhịp.",
    },
    "licence-updates": {
      name: "Giấy phép, voucher và cập nhật",
      about: "Đăng nhập từ Settings → Licence, hoặc dán một dòng giấy phép; voucher cho giảm giá hoặc cả một phiên bản, được kiểm tra không cần kết nối; djmanzo tìm phiên bản mới mỗi ngày một lần và cài khi đóng ứng dụng, không bao giờ giữa set.",
      scene: "Dựng máy ở địa điểm không có Wi-Fi: giấy phép và voucher được kiểm tra ngoại tuyến, và không gì cập nhật cho tới khi bạn đóng djmanzo.",
    },
    lineage: {
      name: "Âm nhạc từ đâu đến, và một cuốn nhật ký",
      about: "Lịch sử của sáu mươi bảy thể loại — mỗi thể loại bắt đầu ở đâu và khi nào, cái gì đi vào và cái gì sinh ra từ nó, nên lắng nghe điều gì, và những bản ai trong giới cũng biết — mỗi thể loại được nhắc chỉ cách một lần bấm; ba mươi giây của một bản nhạc mang tính bước ngoặt; Wikipedia bằng ngôn ngữ của bạn; và một cuốn nhật ký giữ điều bạn học được đúng vào đêm bạn học nó.",
      scene: "Đi từ reggae sang dancehall sang reggaeton giữa các set, và giữ câu chuyện cho lần sau có người hỏi.",
    },
    "in-app-feedback": {
      name: "Góp ý từ trong djmanzo, do AI đọc",
      about: "Lỗi, mong muốn và câu hỏi gửi từ biểu tượng bánh răng, được AI đọc và chuyển sang tiếng Anh, lưu trên trang này cho chủ dự án, và ghi lên GitHub.",
      waits: "Đang được xây: hiện tại 💬 mở biểu mẫu issue của GitHub để bạn tự đăng.",
    },
    "site-downloads": {
      name: "Phiên bản mới nhất, ngay từ trang này",
      about: "Một lần tải cho mọi phiên bản, bộ cài của bản phát hành mới nhất cho hệ thống của bạn, từ màn hình tải xuống; giấy phép hoặc bản dùng thử mở phần còn lại bên trong djmanzo.",
      waits: "Màn hình tải xuống đã xong; bộ cài sẽ xuất hiện ở đó ngay khi các tệp phát hành được kết nối.",
    },
    safe: {
      name: "Nút SAFE",
      about: "Một lần bấm trên thanh trên cùng đưa mọi nút điều khiển về, xóa mọi hiệu ứng và làm phẳng âm thanh.",
      scene: "Có gì đó nghe sai mà không biết là gì: một lần bấm, và mọi thứ trở lại trong trẻo.",
    },
    feedback: {
      name: "Góp ý, mong muốn và lỗi",
      about: "Biểu tượng 💬 cạnh bánh răng gửi một lỗi, một mong muốn hay bất cứ điều gì dưới dạng biểu mẫu issue GitHub của dự án, đã điền sẵn; phiên bản, hệ thống và phiên bản phần mềm chỉ được thêm khi một ô được đánh dấu, và được hiện ra trước.",
    },
    lights: {
      name: "Đèn theo nhạc",
      about: "Đèn của khán phòng qua Art-Net hoặc sACN, theo phách, câu nhạc và độ mạnh của nhạc: một universe, năm bố cục kênh, pulse, chase, wash và một chế độ tự động chỉ đổi khi sang câu nhạc. Không có đèn chớp.",
      caveat: "Chưa thử với đèn thật.",
      scene: "Một club nhỏ có một node DMX và bốn đèn par: đèn đổi theo câu nhạc, không cần người chỉnh đèn.",
    },
    knowhow: {
      name: "Kiến thức",
      about: "Thẻ thứ hai của khóa học: 110 họ thể loại khắp sáu vùng — mỗi họ hòa với gì, tempo cảm nhận, nhịp điệu, và những động tác DJ của nó hay dùng — 72 kỹ thuật kèm lý thuyết đằng sau, và lý thuyết âm nhạc mà DJ và người dẫn karaoke làm việc cùng, mỗi ý cho biết djmanzo thể hiện nó ở đâu. Sáu mươi bảy thể loại kể lịch sử của mình — bắt đầu ở đâu và khi nào, cái gì đi vào và sinh ra, nên lắng nghe gì, những bản ai cũng biết — mỗi thể loại được nhắc chỉ cách một lần bấm; và mọi điều học được đều lưu trong nhật ký, đúng đêm của nó, với một cuốn sổ gom tất cả.",
      scene: "Có người xin merengue típico mà bạn chủ yếu chơi house: nó hòa với gì và DJ của nó hay dùng gì, trước khi bài hết.",
    },
    "k-rotation": {
      name: "Người hát và lượt",
      about: "Gõ tên người hát và bắt đầu gõ bài của họ; thẻ trên cùng là người tới lượt: nạp bài vào deck nào cũng được với tông họ xin, đưa họ vào ở câu nhạc tiếp theo, đánh dấu đã hát hoặc không có mặt. Kéo một hàng để đổi thứ tự, hoặc kéo một bản nhạc vào bảng để xin bài.",
    },
    "k-voice": {
      name: "Giọng như bản thu, làm giọng dẫn, hoặc bỏ đi",
      about: "Dưới mỗi deck: As recorded, Guide — để lại chút giọng gốc để theo — hoặc Out. Bài mới với người hát được đưa ra với giọng dẫn đã đánh dấu sẵn. Tông dịch từng nửa cung mà không đổi tempo.",
    },
    "k-screen": {
      name: "Màn hình người hát",
      about: "Một cửa sổ thứ hai cho máy chiếu hoặc TV: lời được tô dần khi hát, dòng tiếp theo, đếm nhịp vào, ai tới lượt — trên ảnh bìa bản nhạc hoặc nền được tạo.",
    },
    "k-words": {
      name: "Lời được tìm, và canh thời gian bằng cách nghe",
      about: "Lời bài hát từ chính tệp, một tệp .lrc bên cạnh, hoặc từ LRCLIB cho cả bộ sưu tập ở chế độ nền, giữ lại cho cả đêm. Lời chưa có thời gian được canh bằng cách nghe bản nhạc, bên trong djmanzo, nơi máy có thể chạy mô hình giọng nói.",
      caveat: "Canh thời gian bằng cách nghe cần macOS 10.15 trở lên trên Mac; lời đã có sẵn thời gian thì theo bài trên mọi máy.",
    },
    "k-visuals": {
      name: "Hình ảnh sau lời bài hát",
      about: "Các lớp hình của djmanzo theo phách, stem và micro của người hát, trong đó có preset MilkDrop và của riêng bạn, cùng ảnh nghệ sĩ từ Wikimedia Commons, có ghi nguồn — chọn trong bảng Singers.",
    },
    "k-mics": {
      name: "Mỗi người hát một micro",
      about: "Một chuỗi xử lý cho mỗi micro với preset làm cho karaoke — Singer, Stadium, Radio voice, Big echo, Duet — mỗi người một kênh kiểm âm trên giao diện có đủ đầu ra, và song ca với tên cùng lời của từng người hát theo màu riêng.",
    },
    "k-phones": {
      name: "Người hát từ khán phòng",
      about: "Một mã QR đưa bất kỳ ai trong Wi-Fi vào hàng chờ với một bài từ nhạc của bạn — không gì phát cho tới khi bạn nạp — và khi bạn bật, biểu tượng cảm xúc của họ bay lên ở góc màn hình người hát.",
    },
    "k-breaks": {
      name: "Nhạc giải lao dẫn tới đâu đó",
      about: "Nhạc từ một playlist bạn chọn trong lúc người hát tiếp theo chuẩn bị, được chọn để dẫn vào bài của họ, nhỏ dần khi bạn bắt đầu bài.",
    },
    "k-presets": {
      name: "Preset cho đêm karaoke",
      about: "Vocals out, Guide vocal, Everyone sings, Down a tone, Down a fourth, Up a tone, Original key và Open microphones — limiter bật và master hạ một chút, để micro có khoảng trống trước khi hú.",
    },
    "k-score": {
      name: "Hát có chấm điểm, và các vòng đối đầu",
      about: "Bất kỳ bản nào trong bộ sưu tập đều chấm điểm được, giai điệu được đọc từ vocal đã tách; điểm hiện trên màn hình người hát khi họ hát, kèm bảng xếp hạng sau đó, theo từng người trong song ca và theo đội trong vòng đối đầu.",
      caveat: "Chưa từng thử với micro thật trong khán phòng thật.",
    },
    "k-quiz": {
      name: "Câu đố làm từ nhạc của bạn",
      about: "Các vòng tạo theo quy tắc từ chính bộ sưu tập của bạn — đoán tên bài, một đoạn phát ngược hoặc tua nhanh, các stem vào từng cái một, câu hát bị thiếu — trả lời từ điện thoại, mỗi máy bốn nút.",
    },
    "k-range": {
      name: "Âm vực của người hát, và tông để hát",
      about: "Hai mươi giây người hát lướt từ thấp lên cao, và djmanzo gợi ý những bài hợp giọng, mỗi bài kèm mức đổi tông cần thiết.",
      caveat: "Chưa từng thử với micro thật trong khán phòng thật.",
    },
    "k-guests": {
      name: "Sổ khách, một bài hát cho một vị khách, và WhatsApp",
      about: "Mọi người đã hát được ghi vào nhật ký của đêm. Khi họ đồng ý, hỏi từng câu một: thông tin của họ được lưu, mười lăm giây giọng hát, và một bài hát do nhà cung cấp AI của bạn viết cho họ — về họ, bài họ đã hát và đêm hôm ấy — được djmanzo điền vào biểu mẫu của Suno, rồi đường dẫn hoàn chỉnh gửi tới WhatsApp của họ. Không gì rời khỏi máy trừ khi bạn gửi.",
      caveat: "Suno không có API công khai: djmanzo điền biểu mẫu và bạn bấm Create; bạn cũng là người bấm gửi trong WhatsApp. Viết lời cần một nhà cung cấp AI được cài đặt trong djmanzo.",
    },
    "k-record": {
      name: "Bài hát của người hát, thu lại cho họ",
      about: "Với sự đồng ý riêng, bài hát của họ đúng như khán phòng đã nghe — micro và hiệu ứng của họ trên bản nhạc — lưu thành tệp để tặng họ; và chỉnh cao độ trên micro.",
    },
  },
};

export default w;
