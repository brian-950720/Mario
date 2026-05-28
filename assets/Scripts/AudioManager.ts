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
}