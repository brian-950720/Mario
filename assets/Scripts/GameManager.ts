const {ccclass, property} = cc._decorator;

@ccclass
export default class GameManager extends cc.Component {
    
    @property(cc.Label)
    timerLabel: cc.Label = null; // 顯示在右上角的時間 Label

    public timer: number = 0; // 公開變數，讓 UIManager 可以讀取最終時間
    
    private timeAccumulator: number = 0; // 累加器，確保每 0.1 秒精準跳動
    private isTimerRunning: boolean = false;

    onLoad () {
        // --- 物理引擎設定 ---
        let physicsManager = cc.director.getPhysicsManager();
        physicsManager.enabled = true;
        
        // 畫線除錯功能 (發布時建議維持 0，關閉紅色框線)
        physicsManager.debugDrawFlags = 0; 
        
        // 設定重力
        physicsManager.gravity = cc.v2(0, -1000);
        
        // --- 初始化並開始計時 ---
        this.resetTimer();
        this.startTimer(); 
    }

    public startTimer() {
        this.timer = 0;
        this.timeAccumulator = 0;
        this.isTimerRunning = true;
    }

    public stopTimer() {
        this.isTimerRunning = false;
    }

    public resetTimer() {
        this.timer = 0;
        this.timeAccumulator = 0;
        if (this.timerLabel) {
            this.timerLabel.string = "Time: 0.0";
        }
    }

    update (dt: number) {
        if (this.isTimerRunning) {
            // 將每一幀的時間存進累加器
            this.timeAccumulator += dt;
            
            // 只要累積滿 0.1 秒，計時器才正式跳動
            if (this.timeAccumulator >= 0.1) {
                this.timer += 0.1;
                this.timeAccumulator -= 0.1; // 扣掉 0.1 秒，保留極微小的餘數確保精準
                
                if (this.timerLabel) {
                    this.timerLabel.string = "Time: " + this.timer.toFixed(1);
                }
            }
        }
    }
}