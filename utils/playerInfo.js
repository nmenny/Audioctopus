class PlayerInfo {
    constructor(subscription, inLoop = false) {
        this.player = subscription.player;
        this.subscription = subscription;
        this.inLoop = inLoop ?? false;
    }
}

module.exports = { PlayerInfo };