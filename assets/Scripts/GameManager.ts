const {ccclass, property} = cc._decorator;

@ccclass
export default class GameManager extends cc.Component {
    onLoad () {
        // 取得物理引擎管理器並啟用
        let physicsManager = cc.director.getPhysicsManager();
        physicsManager.enabled = true;
        
        // 【推薦】開啟除錯框線，開發時可以清楚看到碰撞邊界，正式發佈時再註解掉
        physicsManager.debugDrawFlags = cc.PhysicsManager.DrawBits.e_aabbBit | 
                                        cc.PhysicsManager.DrawBits.e_shapeBit;
        
        // 設定重力，預設為 (0, -320)，可以依瑪利歐的手感調整數值，這裡先設 -1000 讓掉落快一點
        physicsManager.gravity = cc.v2(0, -1000);
        //physicsManager.debugDrawFlags = 0;
    }
}