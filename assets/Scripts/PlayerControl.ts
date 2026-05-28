const {ccclass, property} = cc._decorator;

import UIManager from "./UIManager";
import AudioManager from "./AudioManager";

@ccclass
export default class PlayerController extends cc.Component {
    @property(cc.Integer) moveSpeed: number = 300;
    @property(cc.Integer) jumpForce: number = 600;

    private rb: cc.RigidBody = null;
    private anim: cc.Animation = null;
    private moveLeft: boolean = false;
    private moveRight: boolean = false;
    private isGrounded: boolean = false;
    private initialPosition: cc.Vec3 = null; 
    
    private currentAnim: string = "";
    private isInvincible: boolean = false; 
    private isDead: boolean = false; 
    private pendingGrowth: boolean = false; 

    onLoad () {
        this.rb = this.getComponent(cc.RigidBody);
        this.anim = this.getComponent(cc.Animation);
        this.initialPosition = this.node.position;

        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
    }

    onDestroy () {
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
    }

    onKeyDown (event: cc.Event.EventKeyboard) {
        if (UIManager.instance && !UIManager.instance.isPlaying) return;
        if (this.isDead) return; 
        
        switch(event.keyCode) {
            case cc.macro.KEY.a: case cc.macro.KEY.left: this.moveLeft = true; break;
            case cc.macro.KEY.d: case cc.macro.KEY.right: this.moveRight = true; break;
            case cc.macro.KEY.w: case cc.macro.KEY.up: case cc.macro.KEY.space: this.jump(); break;
        }
    }

    onKeyUp (event: cc.Event.EventKeyboard) {
        switch(event.keyCode) {
            case cc.macro.KEY.a: case cc.macro.KEY.left: this.moveLeft = false; break;
            case cc.macro.KEY.d: case cc.macro.KEY.right: this.moveRight = false; break;
        }
    }

    jump () {
        if (UIManager.instance && !UIManager.instance.isPlaying) return;
        if (this.isGrounded && !this.isDead) {
            let v = this.rb.linearVelocity;
            v.y = this.jumpForce;
            this.rb.linearVelocity = v;
            this.isGrounded = false;
            this.playAnim("jump");
            if (AudioManager.instance) AudioManager.instance.playJump();
        }
    }

    update (dt) {
        if (this.pendingGrowth) {
            this.pendingGrowth = false;
            let signX = this.node.scaleX > 0 ? 1 : -1;
            this.node.scaleX = 1.5 * signX;
            this.node.scaleY = 1.5;
            this.node.y += 20; 
        }

        if (UIManager.instance && !UIManager.instance.isPlaying) {
            if (this.rb) this.rb.linearVelocity = cc.v2(0, 0);
            this.playAnim("idle");
            return;
        }

        if (this.isDead) return; 

        let v = this.rb.linearVelocity;
        
        if (this.moveLeft) { 
            v.x = -this.moveSpeed; 
            this.node.scaleX = -Math.abs(this.node.scaleX); 
        } else if (this.moveRight) { 
            v.x = this.moveSpeed; 
            this.node.scaleX = Math.abs(this.node.scaleX); 
        } else { 
            v.x = 0; 
        }
        this.rb.linearVelocity = v;

        if (this.isGrounded) {
            if (v.x !== 0) {
                this.playAnim("walk");
            } else {
                this.playAnim("idle");
            }
        } else {
            this.playAnim("jump");
        }

        if (this.node.y < -500 && !this.isDead) {
            if (UIManager.instance) UIManager.instance.loseLife();
            if (AudioManager.instance) AudioManager.instance.playDamage();
            this.dieAndReborn(); 
        }
    }

    playAnim(animName: string) {
        if (!this.anim) return;
        if (this.currentAnim === animName) return; 
        this.currentAnim = animName;
        this.anim.play(animName);
    }

    onBeginContact(contact, selfCollider, otherCollider) {
        let otherName = otherCollider.node.name;

        // 💡 【緊急修復】：把 Ground 獨立出來，無條件起跳！
        if (otherName === "Ground" || otherName.indexOf("Ground") !== -1) {
            this.isGrounded = true;
        } 
        // 水管跟方塊才需要判斷高度，避免頭撞到方塊底部也能跳
        else if (otherName === "pipe" || otherName === "QuestionBlock" || otherName === "Block") {
            if (selfCollider.node.y > otherCollider.node.y) {
                this.isGrounded = true;
            }
        }

        if (otherName === "Flag") {
            if (UIManager.instance) {
                UIManager.instance.triggerGameOver(true); 
            }
            return; 
        }

        if (otherName.indexOf("Enemy") !== -1 || otherName === "Flower") {
            if (this.isDead) return; 

            let playerBottom = selfCollider.node.y - (selfCollider.node.height * Math.abs(selfCollider.node.scaleY)) / 2;
            
            if (playerBottom > otherCollider.node.y - 5) {
                if (UIManager.instance) UIManager.instance.addScore(100); 

                let enemyCtrl = otherCollider.node.getComponent("EnemyController");
                if (enemyCtrl) {
                    enemyCtrl.die();
                } else {
                    this.scheduleOnce(() => {
                        if (otherCollider.node.isValid) otherCollider.node.destroy();
                    }, 0);
                }
                
                let v = this.rb.linearVelocity;
                v.y = this.jumpForce * 0.8; 
                this.rb.linearVelocity = v;
                this.isGrounded = false;
                this.playAnim("jump");
                if (AudioManager.instance) AudioManager.instance.playStomp();
                
            } else {
                if (this.isInvincible) return; 

                let knockbackDir = selfCollider.node.x < otherCollider.node.x ? -1 : 1;
                this.takeDamage(knockbackDir * 150); 
                let enemyCtrl = otherCollider.node.getComponent("EnemyController");
                if (enemyCtrl) enemyCtrl.playHit();
            }
        }

        if (otherName === "Mushroom") {
            if (UIManager.instance) UIManager.instance.addScore(200);
            if (AudioManager.instance) AudioManager.instance.playMushroom();
            
            otherCollider.node.active = false; 
            this.scheduleOnce(() => { 
                if (otherCollider.node.isValid) otherCollider.node.destroy(); 
            }, 0);
            
            this.pendingGrowth = true; 
        }
    }
    
    private startFlashing() {
        cc.Tween.stopAllByTarget(this.node); 
        cc.tween(this.node)
            .repeatForever(
                cc.tween().to(0.1, { opacity: 100 }).to(0.1, { opacity: 255 })
            )
            .start();
    }

    private stopFlashing() {
        cc.Tween.stopAllByTarget(this.node); 
        this.node.opacity = 255; 
    }

    takeDamage(knockbackX: number) {
        if (this.isInvincible) return;

        this.isInvincible = true;
        this.isDead = true; 
        if (UIManager.instance) UIManager.instance.loseLife();
        if (AudioManager.instance) AudioManager.instance.playDamage();

        this.startFlashing(); 

        this.rb.linearVelocity = cc.v2(knockbackX, 250);

        this.scheduleOnce(() => {
            this.isDead = false;
        }, 0.5);

        this.scheduleOnce(() => {
            this.isInvincible = false;
            this.stopFlashing(); 
        }, 0.5);
    }

    dieAndReborn() {
        this.isInvincible = true;
        this.isDead = false; 
        this.node.setPosition(this.initialPosition);
        this.rb.linearVelocity = cc.v2(0, 0); 
        
        let signX = this.node.scaleX > 0 ? 1 : -1;
        this.node.scaleX = 1.0 * signX;
        this.node.scaleY = 1.0;
        let collider = this.getComponent(cc.PhysicsBoxCollider);
        if (collider) collider.apply();

        this.startFlashing();
        this.scheduleOnce(() => {
            this.isInvincible = false;
            this.stopFlashing();
        }, 1.0);
    }
}