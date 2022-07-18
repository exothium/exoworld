import ScrollablePanel from "phaser3-rex-plugins/templates/ui/scrollablepanel/ScrollablePanel";


class TileInfo extends ScrollablePanel {
    constructor(scene, config) {
        super(scene, config);
        scene.add.existing(this);
    }
}