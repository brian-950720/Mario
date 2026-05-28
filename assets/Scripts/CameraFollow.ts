const {ccclass, property} = cc._decorator;

@ccclass
export default class CameraFollow extends cc.Component {
    @property(cc.Node)
    target: cc.Node = null; // 要跟隨的目標 (玩家)

    update (dt) {
        if (!this.target) return;
        
        // 我們通常只讓瑪利歐的攝影機跟著 X 軸移動，Y 軸固定或限制範圍
        // 這裡先寫最簡單的 X 軸同步
        this.node.x = this.target.x;
    }
}