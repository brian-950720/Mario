const {ccclass, property} = cc._decorator;

@ccclass
export default class UIManager extends cc.Component {
    @property(cc.Label)
    scoreLabel: cc.Label = null;

    @property(cc.Label)
    lifeLabel: cc.Label = null;

    @property(cc.Label)
    timeLabel: cc.Label = null;

    @property(cc.Node)
    uiContainer: cc.Node = null; 

    @property(cc.Node)
    mainCamera: cc.Node = null;  

    @property(cc.Node)
    gameOverPanel: cc.Node = null;

    @property(cc.Label)
    resultText: cc.Label = null;

    // 【新增】：綁定開始遊戲的遮罩面板
    @property(cc.Node)
    gameStartPanel: cc.Node = null;

    private score: number = 0;
    private life: number = 3;
    private gameTime: number = 0;
    private isGameOver: boolean = false; 

    // 【新增】：控制遊戲目前是否可以開始玩 (開局鎖定)
    public isPlaying: boolean = false; 

    public static instance: UIManager = null;

    onLoad() {
        UIManager.instance = this;
        this.updateUI();
        
        if (this.gameOverPanel) this.gameOverPanel.active = false;
        
        // 【新增】：遊戲一開始，強制顯示 Game Start 面板，並鎖定玩家操作
        if (this.gameStartPanel) {
            this.gameStartPanel.active = true;
        }
        this.isPlaying = false; 
        
        cc.director.resume(); 

        // 【新增】：1.2 秒後自動關閉開局提示，解鎖玩家控制
        this.scheduleOnce(() => {
            if (this.gameStartPanel) {
                this.gameStartPanel.active = false;
            }
            this.isPlaying = true; // 解鎖操作！
            console.log("Game Start! 玩家解鎖");
        }, 1.2);
    }

    update(dt: number) {
        // 如果還沒開始玩，或者已經結束，就停止計時
        if (!this.isPlaying || this.isGameOver) return; 

        this.gameTime += dt;
        if (this.timeLabel) {
            this.timeLabel.string = "Time: " + Math.floor(this.gameTime);
        }

        if (this.uiContainer && this.mainCamera) {
            this.uiContainer.x = this.mainCamera.x;
        }
    }

    public addScore(points: number) {
        if (this.isGameOver) return;
        this.score += points;
        this.updateUI();
    }

    public loseLife() {
        if (this.isGameOver) return;
        this.life -= 1;
        this.updateUI();

        if (this.life <= 0) {
            this.triggerGameOver(false); 
        }
    }

    public triggerGameOver(isWin: boolean) {
        if (this.isGameOver) return;
        this.isGameOver = true;

        if (this.gameOverPanel) {
            this.gameOverPanel.active = true;
            if (this.resultText) {
                this.resultText.string = isWin ? "Level Clear!" : "Game Over";
            }
        }

        cc.director.pause(); 
    }

    public restartGame() {
        cc.director.resume(); 
        cc.director.loadScene(cc.director.getScene().name); 
    }

    public backToMenu() {
        cc.director.resume();
        cc.director.loadScene("startscene"); 
    }

    private updateUI() {
        if (this.scoreLabel) this.scoreLabel.string = "Score: " + this.score;
        if (this.lifeLabel) this.lifeLabel.string = "Life: " + this.life;
    }
}