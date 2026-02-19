/* ===========================================
   data.js — ゲームデータ定義
   行動・イベント・キャラ・エンディング
   =========================================== */

// ============ 行動（アクション）データ ============
// 毎ターン プレイヤーが選ぶ行動
// effects: ステータスへの影響（加減算）
const ACTIONS = [
    {
        id: 'morning_exercise',
        name: '🏃 朝活（自力）',
        description: '気合いで早起き＆作業',
        effects: { stamina: -20, aiKnowledge: 0, sideHustle: 5, family: 0, motivation: 5 },
        unlockCondition: null,  // 最初から使える
        dialogue: [
            { speaker: '主人公', text: 'よし、今日も気合いで頑張るぞ…！' },
            { speaker: 'ナレーション', text: '体力を使って作業を進めた。少しずつ前に進んでいる…' },
        ],
    },
    {
        id: 'study_ai',
        name: '📚 AI勉強',
        description: 'AIツールについて学ぶ',
        effects: { stamina: -15, aiKnowledge: 15, sideHustle: 0, family: 0, motivation: 10 },
        unlockCondition: null,
        dialogue: [
            { speaker: '主人公', text: 'AI…よくわからないけど、まず調べてみるか。' },
            { speaker: 'ナレーション', text: 'AIの世界は思ったよりも広かった。知識が深まっていく…' },
        ],
    },
    {
        id: 'side_hustle',
        name: '💻 副業作業',
        description: '副業の案件を進める',
        effects: { stamina: -25, aiKnowledge: 0, sideHustle: 15, family: -5, motivation: 0 },
        unlockCondition: null,
        dialogue: [
            { speaker: '主人公', text: '副業の案件…締め切りが近いな。集中するか。' },
            { speaker: 'ナレーション', text: '地道な作業。でも確実にスキルは付いてきている。' },
        ],
    },
    {
        id: 'family_time',
        name: '👨‍👩‍👧 家族サービス',
        description: '家族と過ごす',
        effects: { stamina: -10, aiKnowledge: 0, sideHustle: 0, family: 20, motivation: 15 },
        unlockCondition: null,
        dialogue: [
            { speaker: '妻', text: '今日は一緒にいてくれるの？嬉しい！' },
            { speaker: 'ナレーション', text: '家族の笑顔が、明日への活力になる。' },
        ],
    },
    {
        id: 'rest',
        name: '😴 休息',
        description: '体を休めて回復',
        effects: { stamina: 30, aiKnowledge: 0, sideHustle: 0, family: 5, motivation: 5 },
        unlockCondition: null,
        dialogue: [
            { speaker: '主人公', text: 'たまには休まないと…体がもたない。' },
            { speaker: 'ナレーション', text: 'ゆっくり休んだ。体力が回復した！' },
        ],
    },
    {
        id: 'use_chatgpt',
        name: '🤖 ChatGPT活用',
        description: 'AIアシスタントで効率化',
        effects: { stamina: -10, aiKnowledge: 5, sideHustle: 12, family: 0, motivation: 10 },
        unlockCondition: null,
        requiresUnlock: true,   // 週間判定で解放されるコマンド
        dialogue: [
            { speaker: '主人公', text: 'ChatGPTに聞いてみよう…おお、すごい！' },
            { speaker: 'ナレーション', text: 'AIの力で作業効率が格段にアップした！' },
        ],
    },
    {
        id: 'use_openclaw',
        name: '⚡ OpenClaw活用',
        description: 'AIエージェントに丸投げ',
        effects: { stamina: -5, aiKnowledge: 5, sideHustle: 20, family: 0, motivation: 10 },
        unlockCondition: null,
        requiresUnlock: true,   // 週間判定で解放されるコマンド
        dialogue: [
            { speaker: '主人公', text: 'OpenClawに任せたら…もう終わった!?' },
            { speaker: 'ナレーション', text: 'AIエージェントが自動で処理。驚異的な効率だ…！' },
        ],
    },
    {
        id: 'build_gijiroku',
        name: '🔥 議事録AI構築',
        description: '自分でAIを作る！最強',
        effects: { stamina: -15, aiKnowledge: 10, sideHustle: 25, family: 0, motivation: 15 },
        unlockCondition: null,
        requiresUnlock: true,   // 週間判定で解放されるコマンド
        dialogue: [
            { speaker: '主人公', text: '俺が…AIを作る側になるなんて。' },
            { speaker: 'ナレーション', text: '議事録→タスク化AI、完成！これが最強の武器だ。' },
        ],
    },
];

// ============ ランダムイベントデータ ============
// condition: 発生条件（ステータスやWeek番号）
// choices: 選択肢とその効果
const EVENTS = [
    // ===== 固定イベント（特定Weekで必ず発生） =====
    {
        id: 'chatgpt_encounter',
        name: 'AIとの出会い',
        type: 'fixed',
        triggerWeek: 2,       // Week2の最初のターンで発生
        triggerTurn: 0,
        dialogue: [
            { speaker: 'ナレーション', text: 'ある日の朝活コミュニティにて——' },
            { speaker: '朝活仲間', text: 'なあ、ChatGPTって知ってるか？' },
            { speaker: '主人公', text: 'ChatGPT…？なにそれ？' },
            { speaker: '朝活仲間', text: '最近話題のAIだよ。なんでも答えてくれるんだ。' },
            { speaker: '朝活仲間', text: '文章作成とか、調べ物とか…マジで便利だぜ。' },
            { speaker: '主人公', text: '（…AIか。ちょっと調べてみるか）' },
        ],
        choices: null,  // 選択肢なし（固定イベント）
        autoEffect: { aiKnowledge: 10, motivation: 15 },
    },
    {
        id: 'openclaw_discovery',
        name: 'AIエージェントという世界',
        type: 'fixed',
        triggerWeek: 3,
        triggerTurn: 0,
        dialogue: [
            { speaker: 'ナレーション', text: 'ChatGPTで生産性が上がってきた頃——' },
            { speaker: '主人公', text: 'ChatGPTは便利だけど…もっと自動化できないかな。' },
            { speaker: 'ナレーション', text: 'ネットで見つけた「AIエージェント」という概念。' },
            { speaker: '主人公', text: 'AIに指示するだけで、勝手にタスクを進めてくれる…？' },
            { speaker: '主人公', text: 'OpenClawっていうツールがあるのか。試してみよう。' },
        ],
        choices: null,
        autoEffect: { aiKnowledge: 10, motivation: 10 },
    },
    {
        id: 'gijiroku_epiphany',
        name: 'AIを「作る」側へ',
        type: 'fixed',
        triggerWeek: 4,
        triggerTurn: 0,
        dialogue: [
            { speaker: 'ナレーション', text: 'Week4—— ふと気づいた。' },
            { speaker: '主人公', text: 'AIを「使う」だけじゃなく…「作る」こともできるんだ。' },
            { speaker: '主人公', text: '会議の議事録を、自動でタスクに変換するAI…' },
            { speaker: '主人公', text: 'これ、自分で作れるかもしれない。' },
            { speaker: 'ナレーション', text: '最強の魔法が、目の前にある。' },
        ],
        choices: null,
        autoEffect: { aiKnowledge: 10, motivation: 15 },
    },
    // ===== ランダムイベント =====
    {
        id: 'wife_tired',
        name: '妻の疲労限界',
        type: 'random',
        condition: (stats) => stats.family < 40,
        dialogue: [
            { speaker: 'ナレーション', text: '帰宅すると、妻が疲れた様子で待っていた。' },
            { speaker: '妻', text: '…最近、全然手伝ってくれないよね。' },
            { speaker: '妻', text: '私だって毎日大変なんだよ…？' },
        ],
        choices: [
            {
                text: '「ごめん、今日は家のことやるよ」',
                effects: { family: 20, sideHustle: -5 },
                response: [
                    { speaker: '妻', text: '…ありがとう。一緒にやってくれると嬉しい。' },
                    { speaker: 'ナレーション', text: '家族との時間を大切にした。心が温まる。' },
                ],
            },
            {
                text: '「もう少しだけ頑張らせて」',
                effects: { family: -10, motivation: -15 },
                response: [
                    { speaker: '妻', text: '…そう。わかった。' },
                    { speaker: 'ナレーション', text: '妻の表情が曇った。胸が痛い…。' },
                ],
            },
        ],
    },
    {
        id: 'colleague_ask',
        name: '同僚のAI相談',
        type: 'random',
        condition: (stats) => stats.aiKnowledge >= 20,
        dialogue: [
            { speaker: '同僚', text: 'お前、最近AI使ってるんだって？' },
            { speaker: '同僚', text: 'ちょっと教えてくれない？俺もやってみたいんだけど。' },
        ],
        choices: [
            {
                text: '喜んで教える',
                effects: { aiKnowledge: 10, motivation: 10, stamina: -10 },
                response: [
                    { speaker: '同僚', text: 'マジか！ありがとう、お前いいやつだな！' },
                    { speaker: 'ナレーション', text: '教えることで、自分の理解も深まった。' },
                ],
            },
            {
                text: '「今ちょっと忙しくて…」',
                effects: { motivation: -5 },
                response: [
                    { speaker: '同僚', text: 'そっか…残念。また今度な。' },
                    { speaker: 'ナレーション', text: '少し申し訳ない気持ちになった。' },
                ],
            },
        ],
    },
    {
        id: 'health_crash',
        name: '体調崩壊',
        type: 'random',
        condition: (stats) => stats.stamina < 20,
        dialogue: [
            { speaker: 'ナレーション', text: '朝、体が動かない——' },
            { speaker: '主人公', text: 'う…頭が痛い…無理しすぎたか…' },
            { speaker: '妻', text: '大丈夫!? 今日は休みなさい！' },
        ],
        choices: [
            {
                text: '（素直に休む）',
                effects: { stamina: 50, motivation: -10 },
                response: [
                    { speaker: 'ナレーション', text: '一日中寝て過ごした。体力は回復したが、焦りが残る。' },
                ],
            },
            {
                text: '「大丈夫…やらなきゃ…」',
                effects: { stamina: -10, motivation: -20, sideHustle: 5 },
                response: [
                    { speaker: '妻', text: '無理しないでよ…！' },
                    { speaker: 'ナレーション', text: '意地で作業したが、効率は最悪だった…。' },
                ],
            },
        ],
    },
    {
        id: 'baby_smile',
        name: '子供の笑顔',
        type: 'random',
        condition: (stats) => stats.family >= 50,
        dialogue: [
            { speaker: 'ナレーション', text: '帰宅すると、子供が駆け寄ってきた。' },
            { speaker: '子供', text: 'パパ〜！おかえり〜！' },
            { speaker: '主人公', text: '（…この笑顔のために、頑張ってるんだよな）' },
        ],
        choices: [
            {
                text: '思いっきり遊ぶ',
                effects: { family: 10, motivation: 20, stamina: -15 },
                response: [
                    { speaker: 'ナレーション', text: 'たくさん遊んだ。疲れたけど、心が満たされた。' },
                ],
            },
            {
                text: '「パパ、今日は少し仕事があるんだ」',
                effects: { sideHustle: 5, family: -5 },
                response: [
                    { speaker: '子供', text: 'えー…わかった…' },
                    { speaker: 'ナレーション', text: '少し罪悪感を感じながら、作業に戻った。' },
                ],
            },
        ],
    },
    {
        id: 'viral_post',
        name: 'バズったポスト',
        type: 'random',
        condition: (stats) => stats.sideHustle >= 30,
        dialogue: [
            { speaker: 'ナレーション', text: '朝起きてスマホを見ると——' },
            { speaker: '主人公', text: 'え…昨日のポスト、1000いいね超えてる!?' },
            { speaker: '主人公', text: '「AIで業務効率化した話」がバズった…！' },
        ],
        choices: [
            {
                text: 'フォロワーに感謝のリプを返す',
                effects: { sideHustle: 10, motivation: 15, stamina: -5 },
                response: [
                    { speaker: 'ナレーション', text: '反響が大きい。副業の宣伝にもなった！' },
                ],
            },
            {
                text: '調子に乗らず、黙々と作業する',
                effects: { sideHustle: 5, aiKnowledge: 5 },
                response: [
                    { speaker: 'ナレーション', text: '地に足をつけて、実力を磨く。それが正解だ。' },
                ],
            },
        ],
    },
    {
        id: 'boss_overtime',
        name: '上司の残業要請',
        type: 'random',
        condition: () => true,
        dialogue: [
            { speaker: '上司', text: 'おい、今日ちょっと残ってくれないか？' },
            { speaker: '上司', text: '急ぎの仕事が入ってさ。' },
            { speaker: '主人公', text: '（今日は朝活の成果をまとめたかったのに…）' },
        ],
        choices: [
            {
                text: '「わかりました」（残業する）',
                effects: { stamina: -20, motivation: -10, family: -5 },
                response: [
                    { speaker: 'ナレーション', text: '遅くまで残業した。朝活の時間がまた削られる…。' },
                ],
            },
            {
                text: '「すみません、今日は予定がありまして」',
                effects: { motivation: 5, family: 5 },
                response: [
                    { speaker: '上司', text: 'そうか…まあいいけど。' },
                    { speaker: 'ナレーション', text: '勇気を出して断った。自分の時間を守ることも大切だ。' },
                ],
            },
        ],
    },
    // ===== ランダムイベント（追加分） =====
    {
        id: 'morning_mentor',
        name: '朝活メンターの出現',
        type: 'random',
        condition: (stats) => stats.aiKnowledge >= 40,
        dialogue: [
            { speaker: 'ナレーション', text: '朝活コミュニティで、ある人物に声をかけられた。' },
            { speaker: 'メンター', text: 'いい動きしてるね。AI、かなり使い込んでるでしょ？' },
            { speaker: '主人公', text: 'え…見ててくれたんですか？' },
            { speaker: 'メンター', text: '僕もAIで事業をやってるんだ。少しアドバイスしようか？' },
        ],
        choices: [
            {
                text: '「ぜひお願いします！」',
                effects: { aiKnowledge: 15, sideHustle: 10, motivation: 15 },
                response: [
                    { speaker: 'メンター', text: '大事なのは「仕組み化」だよ。AIは道具、設計は君がやる。' },
                    { speaker: 'ナレーション', text: 'メンターの言葉が、視界を広げた。' },
                ],
            },
            {
                text: '「自分のペースでやりたいので…」',
                effects: { motivation: 5 },
                response: [
                    { speaker: 'メンター', text: 'いいね、その芯の強さは大事だよ。応援してる。' },
                    { speaker: 'ナレーション', text: '自分を信じる道を選んだ。' },
                ],
            },
        ],
    },
    {
        id: 'family_dinner',
        name: '家族団らん',
        type: 'random',
        condition: (stats) => stats.family >= 60,
        dialogue: [
            { speaker: 'ナレーション', text: '久しぶりに家族でゆっくり夕食を囲んだ。' },
            { speaker: '妻', text: '最近、バランス取れてきたよね。嬉しい。' },
            { speaker: '子供', text: 'パパ〜！ハンバーグおいしいね！' },
        ],
        choices: [
            {
                text: '「週末はみんなでお出かけしよう！」',
                effects: { family: 15, motivation: 20, stamina: -5 },
                response: [
                    { speaker: '子供', text: 'やったー！！動物園行きたい！！' },
                    { speaker: 'ナレーション', text: '家族の笑顔が、明日への活力になる。' },
                ],
            },
            {
                text: '「ありがとう。もう少し頑張るよ」',
                effects: { family: 5, motivation: 10 },
                response: [
                    { speaker: '妻', text: '無理しないでね。あなたのペースでいいんだよ。' },
                    { speaker: 'ナレーション', text: '温かい言葉に、心が癒された。' },
                ],
            },
        ],
    },
    {
        id: 'side_client',
        name: '副業の初クライアント',
        type: 'random',
        condition: (stats) => stats.sideHustle >= 50,
        dialogue: [
            { speaker: 'ナレーション', text: 'ある日、DMが届いた——' },
            { speaker: 'クライアント', text: 'あなたのAI活用記事を見ました。うちの業務も相談できますか？' },
            { speaker: '主人公', text: '（初めてのクライアント…！これはチャンスだ…！）' },
        ],
        choices: [
            {
                text: '全力で対応する',
                effects: { sideHustle: 20, aiKnowledge: 5, stamina: -15, family: -5 },
                response: [
                    { speaker: 'クライアント', text: 'すごい！こんなに早く提案いただけるとは。' },
                    { speaker: 'ナレーション', text: '初収入のチャンス。でも体力と家族の時間を犠牲にした。' },
                ],
            },
            {
                text: '無理のない範囲で引き受ける',
                effects: { sideHustle: 10, motivation: 10 },
                response: [
                    { speaker: 'クライアント', text: 'ありがとうございます、ゆっくりでいいですよ。' },
                    { speaker: 'ナレーション', text: '無理せず、着実に信頼を積み重ねる。' },
                ],
            },
        ],
    },
    {
        id: 'burnout_warning',
        name: 'バーンアウト警告',
        type: 'random',
        condition: (stats) => stats.stamina < 30 && stats.motivation < 40,
        dialogue: [
            { speaker: 'ナレーション', text: '朝、アラームが鳴っても体が動かない——' },
            { speaker: '主人公', text: '…なんのために起きるんだっけ。' },
            { speaker: '主人公', text: '全部やめたい…もう疲れた…' },
            { speaker: 'ナレーション', text: '⚠️ バーンアウト（燃え尽き症候群）の危険信号。' },
        ],
        choices: [
            {
                text: '思い切って1日完全休養する',
                effects: { stamina: 40, motivation: 30, sideHustle: -10 },
                response: [
                    { speaker: 'ナレーション', text: '一日中ゴロゴロした。罪悪感はあるが…体も心も楽になった。' },
                    { speaker: '主人公', text: '…よし。また明日から頑張ろう。' },
                ],
            },
            {
                text: '根性で乗り越える',
                effects: { stamina: -15, motivation: -20, sideHustle: 5 },
                response: [
                    { speaker: 'ナレーション', text: '力ずくで動いた。でも効率はひどい。' },
                    { speaker: 'ナレーション', text: '⚠️ このままでは本当に倒れる…。' },
                ],
            },
        ],
    },
    {
        id: 'ai_news',
        name: 'AIニュース速報',
        type: 'random',
        condition: () => true,  // 常時発生可能
        dialogue: [
            { speaker: 'ナレーション', text: '朝のニュースを見ていると——' },
            { speaker: 'ナレーション', text: '「AI技術の進化が加速、新モデル発表」' },
            { speaker: '主人公', text: 'おお…また世界が変わりそうだ。' },
        ],
        choices: [
            {
                text: 'すぐに新技術を調査する',
                effects: { aiKnowledge: 10, stamina: -10, motivation: 10 },
                response: [
                    { speaker: '主人公', text: 'なるほど…これは使えそうだ！' },
                    { speaker: 'ナレーション', text: '最先端の知識を吸収した。' },
                ],
            },
            {
                text: '後でチェックしよう',
                effects: { motivation: -5 },
                response: [
                    { speaker: 'ナレーション', text: '忙しさに追われて、結局チェックし忘れた…。' },
                ],
            },
        ],
    },
];

// ============ エンディング条件 ============
// 上から順にマッチ判定。最初にtrueになったエンディングが採用される
const ENDINGS = [
    // ===== SECRET END（2周目以降限定） =====
    {
        id: 'secret_end',
        rank: 'SS',
        name: '👑 SECRET END — 朝活マスター',
        // 2周目以降 かつ 全ステータス80以上で到達
        condition: (stats) =>
            localStorage.getItem('ai_rpg_cleared') === 'true'
            && stats.aiKnowledge >= 80 && stats.sideHustle >= 80
            && stats.family >= 80 && stats.motivation >= 60 && stats.stamina >= 50,
        story: [
            { speaker: 'ナレーション', text: '——この物語の先を、あなたは知っている。' },
            { speaker: '主人公', text: '2度目の朝活ジャーニー…今度は全てを手に入れた。' },
            { speaker: 'ナレーション', text: 'AI起業、家族との絆、そして健康。全てが最高水準。' },
            { speaker: '妻', text: 'パパは本当にすごいね。尊敬してるよ。' },
            { speaker: '主人公', text: 'ありがとう。でもこれは、みんなのおかげだ。' },
            { speaker: 'ナレーション', text: '完璧な朝活ライフ。これが真の最強END——' },
        ],
    },
    // ===== TRUE END =====
    {
        id: 'true_end',
        rank: 'S',
        name: '🌟 TRUE END — AI起業家パパ',
        condition: (stats) =>
            stats.aiKnowledge >= 80 && stats.sideHustle >= 60 && stats.family >= 50,
        story: [
            { speaker: 'ナレーション', text: '4週間後——' },
            { speaker: 'ナレーション', text: 'あなたはAIのスキルを活かし、副業を軌道に乗せた。' },
            { speaker: '妻', text: '最近、すごく楽しそうだよね。' },
            { speaker: '主人公', text: 'うん。家族も大事にしながら、自分のやりたいことができてる。' },
            { speaker: '主人公', text: 'AIは俺の人生を変えてくれた——いや、俺が変わったんだ。' },
            { speaker: 'ナレーション', text: '手取り19万の現場監督が、AI起業家へ。' },
            { speaker: 'ナレーション', text: 'これはゲームの話だけど…あなたの物語でもある。' },
        ],
    },
    // ===== GOOD END =====
    {
        id: 'good_end',
        rank: 'A',
        name: '⭐ GOOD END — まだまだ成長中',
        condition: (stats) =>
            stats.aiKnowledge >= 50 && stats.sideHustle >= 40,
        story: [
            { speaker: 'ナレーション', text: '4週間後——' },
            { speaker: '主人公', text: 'まだ道半ばだけど…確実に変わってきてる。' },
            { speaker: '主人公', text: 'AIの力を借りれば、もっと先へ行ける気がする。' },
            { speaker: 'ナレーション', text: '成長の種は確実に芽吹いている。' },
            { speaker: 'ナレーション', text: 'あとは、行動し続けるだけだ。' },
        ],
    },
    // ===== BAD END: 体力0 =====
    {
        id: 'bad_end_burnout',
        rank: 'C',
        name: '💀 BAD END — 燃え尽きた朝',
        // MainScene/EventSceneから直接呼ばれるため、conditionは補助的
        condition: (stats) => stats.stamina <= 0,
        story: [
            { speaker: 'ナレーション', text: '——体が、動かない。' },
            { speaker: '主人公', text: '……。' },
            { speaker: '妻', text: 'ちょっと！しっかりして！！' },
            { speaker: 'ナレーション', text: '無理をしすぎた。体が限界を超えた。' },
            { speaker: 'ナレーション', text: '朝活チャレンジは、ここで終わる——' },
            { speaker: 'ナレーション', text: '体を壊しては、何も始まらない。休む勇気も、強さだ。' },
        ],
    },
    // ===== BAD END: 家族崩壊 =====
    {
        id: 'bad_end_family',
        rank: 'C',
        name: '💔 BAD END — 家族崩壊',
        condition: (stats) => stats.family <= 0,
        story: [
            { speaker: 'ナレーション', text: '——ある夜。帰宅すると、家の中が静かだった。' },
            { speaker: '主人公', text: '…ただいま。あれ、誰もいない…？' },
            { speaker: 'ナレーション', text: 'テーブルの上に、一枚の手紙。' },
            { speaker: '妻', text: '「しばらく実家に帰ります。子供も連れていきます。」' },
            { speaker: '主人公', text: '…嘘だろ…' },
            { speaker: 'ナレーション', text: '何のための朝活だったのか。大切なものを見失った代償は、大きい。' },
        ],
    },
    // ===== NORMAL END（デフォルト） =====
    {
        id: 'normal_end',
        rank: 'B',
        name: '💤 NORMAL END — 一歩は踏み出した',
        condition: () => true,  // デフォルト
        story: [
            { speaker: 'ナレーション', text: '4週間後——' },
            { speaker: '主人公', text: '劇的には変わらなかった。でも…' },
            { speaker: '主人公', text: '「変わりたい」と思った。その一歩は大きい。' },
            { speaker: 'ナレーション', text: 'まだ間に合う。あなたの朝活は、ここから始まる。' },
        ],
    },
];

// ============ BtoB導線テキスト ============
const ENDROLL_TEXT = {
    message: [
        'プレイありがとうございます！',
        '',
        'ゲーム内で大活躍した',
        '「議事録→タスク化AI」',
        '',
        '実は現実世界でも私が',
        '構築代行しています。',
    ],
    cta: {
        business: {
            label: '👉 法人向け: AI導入の無料相談',
            url: 'https://example.com/contact',
        },
        personal: {
            label: '👉 個人向け: Xでフォロー',
            url: 'https://x.com/jura_log',
        },
    },
    shareTemplate: '🎮 AI朝活RPGをプレイ！\n\n4週間の朝活ジャーニー\n🧠AI知識: {ai} 💼副業力: {side}\n👨‍👩‍👧家族: {family}\n結果: {ending}\n\n#AI朝活RPG #AI自動化',
};
