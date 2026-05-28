const {ccclass, property} = cc._decorator;

@ccclass
export default class BlockController extends cc.Component {
    // 這裡挖一個洞，讓我們可以在編輯器裡把蘑菇 Prefab 塞進來
    @property(cc.Prefab)
    mushroomPrefab: cc.Prefab = null;

    private isUsed: boolean = false; // 紀錄方塊是否已經被頂過了

    onBeginContact(contact, selfCollider, otherCollider) {
        // 如果被頂過了，就不再有反應
        if (this.isUsed) return;

        if (otherCollider.node.name === "Player") {
            let normal = contact.getWorldManifold().normal;
            
            // 法線 (Normal) 是由方塊指向玩家。
            // 如果 normal.y < -0.5，代表玩家在方塊的正下方往上撞
            if (normal.y < -0.5) {
                this.isUsed = true;
                console.log("玩家頂了方塊！生出蘑菇！");

                // 1. 動態生成蘑菇
                if (this.mushroomPrefab) {
                    let mushroom = cc.instantiate(this.mushroomPrefab);
                    mushroom.setParent(this.node.parent); // 放在跟方塊同一個階層
                    
                    // 將蘑菇的位置設在方塊的「正上方」一點點
                    mushroom.setPosition(this.node.x, this.node.y + this.node.height);
                    
                    // 給蘑菇一個往上的初速度，營造「彈出來」的感覺
                    let rb = mushroom.getComponent(cc.RigidBody);
                    if (rb) {
                        rb.linearVelocity = cc.v2(0, 300);
                    }
                }

                // 2. 改變方塊外觀 (表示已經用過了)
                // 這裡我們簡單把顏色變暗，如果你有空方塊的圖片，可以用 this.getComponent(cc.Sprite).spriteFrame 替換
                this.node.color = cc.Color.GRAY; 
            }
        }
    }
}