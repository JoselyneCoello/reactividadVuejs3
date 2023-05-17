class PlatziReactive {
    //DEPENDENCIAS
    deps = new Map(); //mapa de dependencias
    constructor (options){
        //ORIGEN
        this.origen = options.data();
        const self = this;
        //DESTINO
        this.$data = new Proxy(this.origen, {
            get(target, name){
                if (Reflect.has(target, name)) {
                    self.track(target, name);
                    return Reflect.get(target, name);
                }
                console.warn("La propiedad", name, "no existe");
                return "";
            },
            set(target, name, value){
                Reflect.set(target, name, value);
                self.trigger(name);
            }
        });
    }
    //ORIGEN
    // mount(){
    //     document.querySelectorAll("*[p-text]").forEach(el => {
    //         this.pText(el, this.origen, el.getAttribute("p-text"));
    //     })
    // }

    track(target, name){
        if(!this.deps.has(name)){
            const effect = () => {
                document.querySelectorAll(`*[p-text=${name}]`).forEach(el => {
                    this.pText(el, target, name);
                });
            };
            this.deps.set(name, effect);
        }
    }

    trigger(name){
        const effect = this.deps.get(name);
        effect();
    }
    //DESTINO
    mount(){
        document.querySelectorAll("*[p-text]").forEach(el => {
            this.pText(el, this.$data, el.getAttribute("p-text"));
        });

        document.querySelectorAll("*[p-model]").forEach(el => {
            const name = el.getAttribute("p-model");
            this.pModel(el, this.$data, name);

            el.addEventListener("input", () => {
                Reflect.set(this.$data, name, el.value);
            });
        });

        document.querySelectorAll("*[p-bind]").forEach ( el => {
            const name = el.getAttribute("p-bind");
            this.pBind(el, this.$data, name.split(":"))
        })
    }
    pText( el, target, name) {
        el.innerText = Reflect.get(target, name);
    }
    pModel (el, target, name) {
        el.value = Reflect.get(target, name);
    }
    pBind (el, target, name){
        el.setAttribute(name[0], Reflect.get(target, name[1]))
    }
}
var Platzi  = {
    createApp(options) {
        return new PlatziReactive (options);
    }
};