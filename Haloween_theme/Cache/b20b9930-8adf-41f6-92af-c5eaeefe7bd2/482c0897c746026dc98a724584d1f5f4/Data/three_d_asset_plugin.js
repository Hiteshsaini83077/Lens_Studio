// -----JS CODE-----
// @input Asset.RenderMesh mesh
// @input Asset.Texture texture
// @input Asset.Material material   
// @input int renderOrder 
// @input bool useShadow = true
// @input float shadowDensity = 1.0 { "showIf": "useShadow", "widget": "slider", "min": 0.0, "max": 1.0, "step": 0.001 }
// @input Asset.Texture whiteTex

// Import module

/* Destruction Helper Part (to avoid issues with modules in Fiji) */

/**
 * @class
 * @param {ScriptComponent} inputScript 
 */
function DestructionHelper(inputScript) {
    var manager = this;
    manager._isAlive = true;
    manager._toDestroy = [];
    inputScript.createEvent("OnDestroyEvent").bind(function() {
        manager._isAlive = false;
        manager._toDestroy.forEach(function(element) {
           if(!isNull(element)) {
                element.destroy();
           } 
        });
    })
};

/**
 * Takes a function that will only be called if the script has not been destroyed.
 * Returns a function to be passed to other API.
 * @template {function} T
 * @param {T} callback 
 * @returns {T}
 */
DestructionHelper.prototype.safeCallback = function(callback) {
    var manager = this;
    return function() {
        if(manager._isAlive) {
            callback.apply(null, arguments);
        }
    };
}

/**
 * Creates a Component of type `type` on the given obj. It will be destroyed when the script is.
 * @template {keyof ComponentNameMap} T
 * @param {SceneObject} obj 
 * @param {T} type 
 * @returns {ComponentNameMap[T]} 
 */
DestructionHelper.prototype.createComponent = function(obj, type) {
    var comp = obj.createComponent(type);
    this._toDestroy.push(comp);
    return comp;
}

/**
 * Creates a SceneObject with the given parent. It will be destroyed when the script is.
 * @param {SceneObject} parent 
 * @returns {SceneObject}
 */
DestructionHelper.prototype.createSceneObject = function(parent) {
    var obj = global.scene.createSceneObject("");
    obj.setParent(parent);
    this._toDestroy.push(obj);
    return obj;
}

var manager = new DestructionHelper(script);

var so = script.getSceneObject();

var renderMeshVisual = manager.createComponent(so, "Component.RenderMeshVisual");

renderMeshVisual.mesh = script.mesh;
renderMeshVisual.mainMaterial = script.material.clone();
renderMeshVisual.mainPass.baseTex = script.texture;
renderMeshVisual.mainPass.materialParamsTex = script.whiteTex;

if (script.useShadow) {
    renderMeshVisual.meshShadowMode = MeshShadowMode.Caster;
    renderMeshVisual.shadowColor = new vec4(0, 0, 0, 255);
    renderMeshVisual.shadowDensity = script.shadowDensity;
} else {
    renderMeshVisual.meshShadowMode = MeshShadowMode.None;
}

renderMeshVisual.setRenderOrder(script.renderOrder);

Object.defineProperties(script, {
    renderOrder: {
        get: function() {
            if (!isNull(renderMeshVisual)) {
                return renderMeshVisual.getRenderOrder();
            } else {
                return null;
            }
        },
        set: function(value) {
            if (!isNull(renderMeshVisual)) {
                renderMeshVisual.setRenderOrder(value);
            }
        }
    },
    useShadow: {
        get: function() {
            return (renderMeshVisual.meshShadowMode === MeshShadowMode.Caster);
        }, 
        set: function(useShadow) {
            if (!isNull(renderMeshVisual)) {
                if (useShadow) {
                    renderMeshVisual.meshShadowMode = MeshShadowMode.Caster;
                } else {
                    renderMeshVisual.meshShadowMode = MeshShadowMode.None;
                }
                
            }
        }
    },
    shadowDensity: {
        get: function() {
            if (!isNull(renderMeshVisual)) {
                return renderMeshVisual.shadowDensity;
            }
        },
        set: function(shadowDensity) {
            if (!isNull(renderMeshVisual)) {
                renderMeshVisual.shadowDensity = shadowDensity;
            }
        }
    }
});