const {ccclass, property} = cc._decorator;

// 引入需要的腳本
import FirebaseManager from "./FirebaseManager";
import GameManager from "./GameManager";

@ccclass
export default class UIManager extends cc.Component {
    public static instance: UIManager = null;

    // ==========================================
    // 遊戲核心數據
    // ==========================================
    public isPlaying: boolean = true;
    public currentScore: number = 0;
    public lives: number = 3; 

    @property(cc.Label) scoreLabel: cc.Label = null; // 左上角的目前分數
    @property(cc.Label) lifeLabel: cc.Label = null;  // 左上角的目前生命

    // ==========================================
    // 排行榜與 Game Over UI 組件
    // ==========================================
    @property(cc.Node) gameOverPanel: cc.Node = null;
    @property(cc.EditBox) nameInput: cc.EditBox = null;
    @property(cc.Button) submitBtn: cc.Button = null;
    @property(cc.Label) sortBtnLabel: cc.Label = null;
    @property(cc.Node) leaderboardContent: cc.Node = null; 
    @property(cc.Prefab) rankItemPrefab: cc.Prefab = null; 
    
    @property(GameManager) gameManager: GameManager = null; 

    // 🌟 [新增] 用來顯示本局最終成績的標籤
    @property(cc.Label) finalScoreLabel: cc.Label = null;
    @property(cc.Label) finalTimeLabel: cc.Label = null;

    private currentSort: string = 'score'; // 目前排序狀態：'score' 或是 'clearTime'
    private scoreSubmitted: boolean = false; // 防呆：避免玩家重複上傳

    onLoad() {
        UIManager.instance = this;
        
        // 初始化參數
        this.isPlaying = true;
        this.currentScore = 0;
        this.scoreSubmitted = false;
        
        this.updateScoreUI();
        this.updateLifeUI();

        // 一開始隱藏 GameOver 面板
        if (this.gameOverPanel) {
            this.gameOverPanel.active = false;
        }
    }

    // ==========================================
    // 遊戲進程邏輯 (加分、扣血)
    // ==========================================
    addScore(points: number) {
        if (!this.isPlaying) return;
        this.currentScore += points;
        this.updateScoreUI();
    }

    loseLife() {
        if (!this.isPlaying) return;
        this.lives -= 1;
        this.updateLifeUI();

        if (this.lives <= 0) {
            this.triggerGameOver(false);
        }
    }

    private updateScoreUI() {
        if (this.scoreLabel) this.scoreLabel.string = "Score: " + this.currentScore;
    }

    private updateLifeUI() {
        if (this.lifeLabel) this.lifeLabel.string = "Lives: " + this.lives;
    }

    // ==========================================
    // Game Over 與排行榜邏輯
    // ==========================================
    triggerGameOver(isVictory: boolean = false) {
        if (!this.isPlaying) return; 
        this.isPlaying = false;
        
        // 1. 停止遊戲時間
        if (this.gameManager) this.gameManager.stopTimer();

        // 2. 顯示面板
        if (this.gameOverPanel) this.gameOverPanel.active = true;

        // 🌟 3. 將最終成績寫入面板上的 Label
        if (this.finalScoreLabel) {
            this.finalScoreLabel.string = "Score: " + this.currentScore;
        }
        if (this.finalTimeLabel && this.gameManager) {
            this.finalTimeLabel.string = "Time: " + this.gameManager.timer.toFixed(1) + "s";
        }

        // 4. 自動刷新排行榜
        this.refreshLeaderboard();
    }

    // 按鈕綁定：送出分數
    async onSubmitScore() {
        if (this.scoreSubmitted) return; 
        
        let playerName = this.nameInput.string.trim();
        if (playerName === "") {
            console.log("請輸入名字！");
            return;
        }

        // 從 GameManager 取得結算時間
        let finalTime = this.gameManager ? this.gameManager.timer : 0; 

        if (this.submitBtn) this.submitBtn.interactable = false; 

        if (FirebaseManager.instance) {
            await FirebaseManager.instance.uploadScore(playerName, this.currentScore, finalTime);
            
            this.scoreSubmitted = true;
            
            if (this.nameInput) this.nameInput.node.active = false; 
            if (this.submitBtn) this.submitBtn.node.active = false; 
            
            this.refreshLeaderboard();
        }
    }

    // 按鈕綁定：切換排序
    onToggleSort() {
        this.currentSort = (this.currentSort === 'score') ? 'clearTime' : 'score';
        
        if (this.sortBtnLabel) {
            this.sortBtnLabel.string = (this.currentSort === 'score') ? "Order: by score" : "Order: by time";
        }
        
        this.refreshLeaderboard();
    }

    // 刷新排行榜列表
    async refreshLeaderboard() {
        if (!FirebaseManager.instance || !this.leaderboardContent) return;

        this.leaderboardContent.removeAllChildren();

        const scores = await FirebaseManager.instance.fetchScores(this.currentSort);

        scores.forEach((data, index) => {
            let item = cc.instantiate(this.rankItemPrefab);
            let rankScript = item.getComponent("RankItem");
            if (rankScript) {
                rankScript.init(index + 1, data.name, data.score, data.clearTime);
            }
            this.leaderboardContent.addChild(item);
        });
    }

    // ==========================================
    // 場景切換邏輯
    // ==========================================
    onRetry() {
        cc.director.loadScene(cc.director.getScene().name); 
    }

    onMenu() {
        // 如果你的主選單名字不一樣，請記得修改這裡
        cc.director.loadScene("startscene"); 
    }
}