const {ccclass, property} = cc._decorator;

// 【防呆關鍵】：宣告全局變數，騙過 TypeScript，讓它知道 firebase 是存在的
declare const firebase: any;

@ccclass
export default class FirebaseManager extends cc.Component {
    
    // 單例模式：讓其他腳本可以隨時呼叫它 (例如 FirebaseManager.instance.uploadScore)
    public static instance: FirebaseManager = null;
    
    public isReady: boolean = false;

    onLoad() {
        if (FirebaseManager.instance === null) {
            FirebaseManager.instance = this;
            // 讓這個管理員跨場景存活，不會被銷毀
            cc.game.addPersistRootNode(this.node); 
            this.initFirebase();
        } else {
            this.node.destroy();
        }
    }

    initFirebase() {
        console.log("開始載入 Firebase...");
        
        // 1. 動態載入 Firebase 核心 SDK (使用 8.x 兼容版最穩定)
        let scriptApp = document.createElement('script');
        scriptApp.src = "https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js";
        document.head.appendChild(scriptApp);

        scriptApp.onload = () => {
            // 2. 核心載入完畢後，載入 Firestore 資料庫 SDK
            let scriptFirestore = document.createElement('script');
            scriptFirestore.src = "https://www.gstatic.com/firebasejs/8.10.1/firebase-firestore.js";
            document.head.appendChild(scriptFirestore);

            scriptFirestore.onload = () => {
                
                const firebaseConfig = {
                    apiKey: "AIzaSyCkGGwNnBnLQqMczt_baOXp-ZEuZbPkKho",
                    authDomain: "mario-6fa56.firebaseapp.com",
                    databaseURL: "https://mario-6fa56-default-rtdb.firebaseio.com",
                    projectId: "mario-6fa56",
                    storageBucket: "mario-6fa56.firebasestorage.app",
                    messagingSenderId: "233153067886",
                    appId: "1:233153067886:web:79c2e07918e5c20cd81f7f"
                };
                // 初始化 Firebase
                if (!firebase.apps.length) {
                    firebase.initializeApp(firebaseConfig);
                }
                this.isReady = true;
                console.log("Firebase 資料庫連線成功！");
            };
        };
    }

    // ----------------------------------------------------
    // 【功能 1：上傳分數】
    // ----------------------------------------------------
    async uploadScore(playerName: string, score: number, time: number) {
        if (!this.isReady) {
            console.log("Firebase 還沒準備好！");
            return;
        }
        try {
            await firebase.firestore().collection("scores").add({
                name: playerName,
                score: score,
                clearTime: parseFloat(time.toFixed(1)), // 強制轉為小數點後一位的數字
                timestamp: firebase.firestore.FieldValue.serverTimestamp() // 記錄真實上傳時間
            });
            console.log("分數上傳成功！");
        } catch (error) {
            console.error("上傳失敗：", error);
        }
    }

    // ----------------------------------------------------
    // 【功能 2：雙排序讀取分數】
    // ----------------------------------------------------
    async fetchScores(sortBy: string = 'score') {
        if (!this.isReady) return [];
        try {
            let query = firebase.firestore().collection("scores");
            
            if (sortBy === 'score') {
                query = query.orderBy("score", "desc"); // 分數由大到小
            } else {
                query = query.orderBy("clearTime", "asc"); // 耗時由小到大 (越快越前面)
            }
            
            // 抓取前 10 名
            const snapshot = await query.limit(10).get();
            return snapshot.docs.map(doc => doc.data());
        } catch (error) {
            console.error("讀取排行榜失敗：", error);
            return [];
        }
    }
}