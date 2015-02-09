var Engine = function(renderer)
{
    this.renderer = renderer;
    this.isRunning = false;
    this.scene = undefined;
    this.timer = undefined;
}

Engine.prototype.run = function()
{
    if (this.scene) {
        this.timer.callbacks.push(this.timeShift.bind(this));
    }
    this.timer.start();
    this.isRunning = true;
}

Engine.prototype.pause = function()
{
    this.timer.stop();
    this.timer.callbacks = [];
    this.isRunning = false;
}

Engine.prototype.render = function()
{
    renderer.render(this.scene.scene, this.scene.camera.camera);
}

Engine.prototype.timeShift = function(timeElapsed)
{
    this.scene.updateTime(timeElapsed);
    this.scene.camera.updateTime(timeElapsed);
    this.render();
}

Engine.Math = {
    applyRatio: function(ratio, h, l)
    {
        return (h - l) * ratio + l;
    },

    'clamp': function(v, min, max)
    {
        return Math.min(max, Math.max(min, v));
    },

    'findRatio': function(pos, h, l)
    {
        return (pos - l) / (h - l);
    },
}

Engine.Util = {
    createSprite: function(location, w, h)
    {
        var texture = Engine.Util.getTexture('sprites/' + location);
        var geometry = new THREE.PlaneGeometry(w, h);
        var material = new THREE.MeshBasicMaterial({
            //color: 0xffffff,
            //wireframe: true,
            side: THREE.DoubleSide,
            map: texture,
            transparent: true,
        });
        var model = new THREE.Mesh(geometry, material);
        return model;
    },

    createUVMap: function(x, y, w, h, totalW, totalH)
    {
        /* Shave of a tiny bit from the UVMaps to avoid neighbor pixel shine-thru. */
        xc = .1;
        yc = .1;

        x += xc;
        y += yc;
        w -= xc*2;
        h -= yc*2;

        var uvs = [
            new THREE.Vector2(x / totalW, (totalH - y) / totalH),
            new THREE.Vector2(x / totalW, (totalH - (y + h)) / totalH),
            new THREE.Vector2((x + w) / totalW, (totalH - (y + h)) / totalH),
            new THREE.Vector2((x + w) / totalW, (totalH - y) / totalH),
        ];
        var uvMap = [
            [uvs[0], uvs[1], uvs[3]],
            [uvs[1], uvs[2], uvs[3]]
        ];
        return uvMap;
    },

    getTexture: function(url)
    {
        /* Default to 8x the sprite size before loading to memory. */
        return Engine.Util.getScaledTexture(url, 8);
    },

    getScaledTexture: function(url, scale)
    {
        var canvas = document.createElement("canvas");
        var texture = new THREE.Texture(canvas);
        var image = new Image();
        image.onload = function() {
            var x = this.width * scale;
            var y = this.height * scale;
            canvas.width = x;
            canvas.height = y;
            var context = canvas.getContext("2d");
            context.imageSmoothingEnabled = false;
            context.drawImage(this, 0, 0, x, y);
            texture.needsUpdate = true;
        }
        image.src = url;
        return texture;
    },
}

Math.RAD = Math.PI/180;

Engine.assets = {};
