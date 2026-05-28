const {ccclass, property} = cc._decorator;

@ccclass
export default class AudioManager extends cc.Component {
    @property({ type: cc.AudioClip })
    bgm: cc.AudioClip = null;

    @property({ type: cc.AudioClip })
    jumpSound: cc.AudioClip = null;

    @property({ type: cc.AudioClip })
    stompSound: cc.AudioClip = null; 

    @property({ type: cc.AudioClip })
    mushroomSound: cc.AudioClip = null; 

    @property({ type: cc.AudioClip })
    damageSound: cc.AudioClip = null; 

    // ==========================================
    // 🌟 以下為新增的 3 個音效變數
    // ==========================================
    @property({ type: cc.AudioClip })
    victorySound: cc.AudioClip = null; 

    @property({ type: cc.AudioClip })
    spawnItemSound: cc.AudioClip = null; 

    @property({ type: cc.AudioClip })
    enemyAttackSound: cc.AudioClip = null; 

    public static instance: AudioManager = null;

    onLoad () {
        AudioManager.instance = this;
    }

    start () {
        if (this.bgm) {
            // 使用更底層的 playMusic 確保 BGM 獨立於其他音效
            cc.audioEngine.playMusic(this.bgm, true);
        }
    }

    // 統一改用 cc.audioEngine.play(audioClip, loop, volume) 
    public playJump() {
        if (this.jumpSound) {
            cc.audioEngine.play(this.jumpSound, false, 1.0);
        } else {
            console.log("【音效錯誤】：跳躍音效檔案未綁定！");
        }
    }

    public playStomp() {
        if (this.stompSound) {
            cc.audioEngine.play(this.stompSound, false, 1.0);
        } else {
            console.log("【音效錯誤】：踩怪音效檔案未綁定！");
        }
    }

    public playMushroom() {
        if (this.mushroomSound) {
            cc.audioEngine.play(this.mushroomSound, false, 1.0);
        } else {
            console.log("【音效錯誤】：蘑菇音效檔案未綁定！");
        }
    }

    public playDamage() {
        if (this.damageSound) {
            cc.audioEngine.play(this.damageSound, false, 1.0);
        } else {
            console.log("【音效錯誤】：受傷音效檔案未綁定！");
        }
    }

    // ==========================================
    // 🌟 以下為新增的播放方法 (完全依照你的撰寫風格)
    // ==========================================
    public playVictory() {
        if (this.victorySound) {
            cc.audioEngine.play(this.victorySound, false, 1.0);
        } else {
            console.log("【音效錯誤】：勝利音效檔案未綁定！");
        }
    }

    public playSpawnItem() {
        if (this.spawnItemSound) {
            cc.audioEngine.play(this.spawnItemSound, false, 1.0);
        } else {
            console.log("【音效錯誤】：問號箱出蘑菇音效檔案未綁定！");
        }
    }

    public playEnemyAttack() {
        if (this.enemyAttackSound) {
            cc.audioEngine.play(this.enemyAttackSound, false, 1.0);
        } else {
            console.log("【音效錯誤】：怪物攻擊音效檔案未綁定！");
        }
    }

    // 新增：讓你可以在過關時呼叫這個來停止背景音樂
    public stopBGM() {
        cc.audioEngine.stopMusic();
    }
}