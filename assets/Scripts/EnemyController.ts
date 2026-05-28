const {ccclass, property} = cc._decorator;

@ccclass
export default class EnemyController extends cc.Component {
    @property(cc.Integer)
    moveSpeed: number = 50; 

    @property(cc.Float)
    patrolTime: number = 2.5; 

    private rb: cc.RigidBody = null;
    private anim: cc.Animation = null;
    private direction: number = -1; 
    private timer: number = 0;
    private isDead: boolean = false;
    private isHitting: boolean = false;

    onLoad () {
        this.rb = this.getComponent(cc.RigidBody);
        this.anim = this.getComponent(cc.Animation);
        
        if (this.anim) this.anim.play("idle");
    }

    update (dt) {
        if (this.isDead || this.isHitting) return;

        this.timer += dt;
        if (this.timer >= this.patrolTime) {
            this.direction *= -1;
            this.timer = 0;
        }

        let v = this.rb.linearVelocity;
        v.x = this.moveSpeed * this.direction;
        this.rb.linearVelocity = v;

        this.node.scaleX = this.direction > 0 ? -Math.abs(this.node.scaleX) : Math.abs(this.node.scaleX);
    }

    // 【修改】：加入播放攻擊/撞擊動畫，並在結束後恢復 idle
    public playHit() {
        if (this.isDead || this.isHitting) return;
        
        this.isHitting = true;
        
        // 播放怪物攻擊玩家的動畫
        if (this.anim) this.anim.play("attack"); 

        this.scheduleOnce(() => {
            this.isHitting = false;
            // 攻擊動作結束後，如果怪物還活著，就切回走路(idle)狀態
            if (!this.isDead && this.anim) {
                this.anim.play("idle"); 
            }
        }, 0.5); // 與玩家的失控/受傷時間保持一致 (0.5秒)
    }

    public die() {
        if (this.isDead) return;
        this.isDead = true;

        if (this.anim) this.anim.play("dead");

        this.scheduleOnce(() => {
            let collider = this.getComponent(cc.PhysicsBoxCollider);
            if (collider) collider.destroy(); 
            
            if (this.rb) {
                this.rb.type = cc.RigidBodyType.Static; 
                this.rb.linearVelocity = cc.v2(0, 0);
            }
        }, 0);

        this.scheduleOnce(() => {
            if (this.anim) this.anim.play("ascend");
            
            cc.tween(this.node)
                .to(1.5, { y: this.node.y + 200, opacity: 0 }, { easing: 'sineOut' }) 
                .call(() => {
                    this.node.destroy();
                })
                .start();
        }, 0.5);
    }

    onBeginContact(contact, selfCollider, otherCollider) {
        if (otherCollider.node.name === "Mushroom") {
            if (UIManager.instance) UIManager.instance.addScore(200);
            
            if (AudioManager.instance) AudioManager.instance.playMushroom();

            // 避開物理鎖定期，在下一幀執行變大與銷毀
            this.scheduleOnce(() => {
                if (otherCollider.node.isValid) otherCollider.node.destroy();
                
                // 記錄原本的面向方向
                let signX = this.node.scaleX > 0 ? 1 : -1;
                
                // 瑪利歐變大 1.5 倍
                this.node.scaleX = 1.5 * signX; 
                this.node.scaleY = 1.5;
                
                // 【關鍵修復】：把瑪利歐往上提拔，避免腳陷進地板！
                // 往上提的距離 = 圖片原始高度 * 膨脹的比例差(0.5) / 2，再加 5 像素的保險空間
                this.node.y += (selfCollider.node.height * 0.5 / 2) + 5;
                
            }, 0);
        }
    }
}