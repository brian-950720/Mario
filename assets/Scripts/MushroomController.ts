const {ccclass, property} = cc._decorator;

@ccclass
export default class MushroomController extends cc.Component {
    @property(cc.Integer) moveSpeed: number = 150; 

    private rb: cc.RigidBody = null;
    private moveDir: number = 1; 
    private isPoppingUp: boolean = true; 

    onLoad () {
        this.rb = this.getComponent(cc.RigidBody);
        if (this.rb) {
            this.rb.gravityScale = 0; 
            this.rb.linearVelocity = cc.v2(0, 0);
        }
    }

    start() {
        cc.tween(this.node)
            .by(0.3, { y: 32 }, { easing: 'cubicOut' })
            .call(() => {
                this.startMovingLogic();
            })
            .start();
    }

    private startMovingLogic() {
        if (!cc.isValid(this.node) || !this.rb) return; 
        
        this.isPoppingUp = false;
        this.rb.gravityScale = 1; 
        this.rb.linearVelocity = cc.v2(this.moveSpeed * this.moveDir, 0);
    }

    update (dt) {
        if (!this.rb || this.isPoppingUp) return;

        let currentVelocity = this.rb.linearVelocity;
        currentVelocity.x = this.moveSpeed * this.moveDir;
        this.rb.linearVelocity = currentVelocity;
    }

    onBeginContact(contact, selfCollider, otherCollider) {
        if (this.isPoppingUp || !cc.isValid(otherCollider.node)) return; 

        let worldManifold = contact.getWorldManifold();
        let normal = worldManifold.normal; 

        // 側向碰撞
        if (Math.abs(normal.x) > 0.6) {
            let otherName = otherCollider.node.name;
            let bouncyNames = ["pipe", "QuestionBlock", "Block"];
            
            // 修正判定：用 `indexOf` 兼容 Ground_123，用 `startsWith` 兼容 Enemy_abc
            if (bouncyNames.includes(otherName) || otherName.indexOf("Ground") !== -1 || otherName.startsWith("Enemy")) {
                this.moveDir *= -1;
                // console.log("蘑菇碰牆/怪物反彈！", otherName);
            }
        }
    }
}