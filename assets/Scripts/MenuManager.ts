const {ccclass, property} = cc._decorator;

@ccclass
export default class MenuManager extends cc.Component {
    // 按鈕點擊事件，接收你在編輯器傳入的場景名稱
    public loadLevel(event: cc.Event, sceneName: string) {
        console.log("準備載入關卡: " + sceneName);
        cc.director.loadScene(sceneName);
    }
}