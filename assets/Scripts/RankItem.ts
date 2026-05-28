const {ccclass, property} = cc._decorator;

@ccclass
export default class RankItem extends cc.Component {
    
    @property(cc.Label)
    rankLabel: cc.Label = null; // 顯示名次

    @property(cc.Label)
    nameLabel: cc.Label = null; // 顯示名字

    @property(cc.Label)
    scoreLabel: cc.Label = null; // 顯示分數

    @property(cc.Label)
    timeLabel: cc.Label = null; // 顯示耗時

    // 這個方法會由 UIManager 呼叫，用來塞入真實資料
    public init(rank: number, playerName: string, score: number, time: number) {
        this.rankLabel.string = "#" + rank;
        this.nameLabel.string = playerName;
        this.scoreLabel.string = score.toString();
        this.timeLabel.string = time.toFixed(1) + "s";
    }
}