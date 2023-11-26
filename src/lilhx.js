"use strict";

let test = null;
let _print = console.log
let STATE_FULL_ELEMENTS = {}
let STATES_VARS = { "lilx": 0 }

let MoveAble = (_self) => {
    let self = _self
    let parent = self.parentNode
    let sibling = self?.nextSibling
    return {
        reset: () => {
            self.removeAttribute("style")
            if (sibling) {
                sibling.outerHTML = `${self.outerHTML}${sibling.outerHTML}` 
            } else {
                parent.append(self)
            }
        },

    }
};

String.prototype.format = String.prototype.format ||
    function () {
        "use strict";
        var str = this.toString();
        if (arguments.length) {
            var t = typeof arguments[0];
            var key;
            var args = ("string" === t || "number" === t) ?
                Array.prototype.slice.call(arguments)
                : arguments[0];

            for (key in args) {
                str = str.replace(new RegExp("\\{" + key + "\\}", "gi"), args[key]);
            }
        }

        return str;
    };


let check_status = (response) => {
    if (response.ok) {
        return response
    } else {
        throw `
        An error occurred while fetching the resource.<br>
        Status: <span id="status">{status}</span><br>
        Status Text: <span id="status-text">{statusText}</span><br>
        URL: <span id="url">{url}</span><br>
        `.format(response)
    }
}

let c_fetch = async (url, method, callback, error_callback) => {
    let response = null;
    fetch(url, {
        method: method?.toUpperCase(),
    }).then((response) => {
        return check_status(response)?.text()
    }).then((body) => {
        response = body
    }).catch((e) => {
        error_callback(e)
    }).finally(() => {
        callback(response)
        return response;
    })
}
let fetch_swap = (elem, target, x) => {
    let __temp = null;
    switch (true) {
        case elem.attributes.swap_inner !== undefined:
            target.innerHTML = x;
            break;
        case elem.attributes.swap_outer !== undefined:
            target.outerHTML = x;
            break;
        case elem.attributes.append !== undefined:
            __temp = document.createElement("div")
            target.append(__temp)
            __temp.outerHTML = x
            break;
        case elem.attributes.prepend !== undefined:
            __temp = document.createElement("div")
            target.prepend(__temp)
            __temp.outerHTML = x
            break;
        case /^\d+$/.test(elem.attributes?.n_swap?.value):
            let nth = elem.attributes?.n_swap?.value;
            nth = nth ? parseInt(nth) : 0;
            target.children[nth].outerHTML = x;
            break;
        default:
            console.log(elem.attributes, `Not a valid swap operation`);
            break;

    }
}

let fetch_error = (elem, error) => {
    let e = elem.querySelector("error")
    if (!e)
        return
    e.innerHTML = error.toString()
    e.style.opacity = 1
    setTimeout(() => {
        e.style.opacity = 0
        setTimeout(() => {
            e.innerHTML = ""

        }, 1000)
    }, 2000)
    _print(e.style.animation)
}

let fetch_handler = (elem) => {
    let callback = elem.attributes?.handler?.value;
    let url = elem.attributes.fetch?.value
    let method = elem.attributes?.method
    let target = elem;
    let fetch_callback = fetch_swap;

    method = method ? method : "get"

    if (elem.attributes.target?.value) {
        target = document.querySelector(elem.attributes.target?.value);
    }
    
    if (callback && typeof window[callback] === 'function') {
        fetch_callback = (x, y, z) => {
            fetch_swap(x, y, z)
            window[callback](x, y, z)
        }
    }
    
    if (url && method) {
        c_fetch(url, method, (x) => fetch_callback(elem, target, x), (x) => fetch_error(elem, x))
    } else {
        _print("Url Not Provided for fetch")
    }
}

let handle_handler = (elem) => {
    let callback = elem.attributes.handler?.value
    window[callback](elem)
    if (elem.parentNode.attributes.statefull) {
        let index = elem.parentNode.attributes?.index?.value
        elem.parentNode.innerHTML = change_state(STATE_FULL_ELEMENTS[index])
    }
    
}

let __handle_click = (target) => {
    if (target.attributes.fetch) {
        fetch_handler(target)
    }
    else if (target.attributes?.handler) {
        handle_handler(target)
    }
    
    return -1;
    
}

let __handle_drag = (element) => {
    console.log("This elemnt is dragged", element)
}

let drag_event = (...x) => {
    console.log(...x)
    // if(event.target.attributes.dragable){
    //     __handle_drag(target)

    // }
}

let click_event = (target) => {
    if (!target || target.attributes == undefined) {
        return
    }
    else if (target.attributes.clickable) {
        __handle_click(target)
    }
    else {
        click_event(target.parentNode)
    }
}

let saveToSessionStorage = (dictionary) => {
    const serializedDictionary = JSON.stringify(dictionary);
    sessionStorage.setItem('STATES_VARS', serializedDictionary);
}

let change_state = (text) => {
    const regex = /\{(?<variable>[^:}]+)[:]?(?<type>[^}]+)?\}/gi;
    const input = text;
    text = input.replace(regex, (_, variable, type) => {
        variable = variable.replace(/[^a-z0-9_]/gi, "_")
        if (type) {
            if (type.toUpperCase() == "INT")
                window[variable] ||= 0
            else if (type.toUpperCase() == "FLOAT")
                window[variable] ||= 0.0
            else if (type.toUpperCase() == "STR")
                window[variable] ||= ""
            else if (type.toUpperCase() == "DIC")
                window[variable] ||= {}
            else if (type.toUpperCase() == "ARRAY")
                window[variable] ||= []
            else
                window[variable] ||= 0;
        } else {
            window[variable] ||= 0;
        }

        
        STATES_VARS[variable] = window[variable]
        return STATES_VARS[variable]

    });
    if (document.body.attributes.save_state != undefined) {
        saveToSessionStorage(STATES_VARS);
    }
    return text;
}

let load_all = ({ target }) => {
    let pointer = 0;
    if (document.body.attributes.load_state != undefined) {
        const storedDictionary = sessionStorage.getItem('STATES_VARS');
        if (storedDictionary) {
            STATES_VARS = JSON.parse(storedDictionary);
            Object.assign(window, STATES_VARS)
        } else {
            _print("No saved State")
        }
    }
    let traverse = (target) => {
        for (let child of target?.childNodes) {
            if (child.attributes?.statefull) {
                STATE_FULL_ELEMENTS[pointer] ||= child.innerHTML
                child.setAttribute("index", pointer)
                pointer++;
                child.innerHTML = change_state(child.innerHTML)
            }
            traverse(child)
        }
    }
    traverse(target)
}

document.querySelectorAll("[dragable]").forEach(x => {
    x.style.cursor = "pointer";
})

window.onclick = (event) => {
    click_event(event.target)
};


let follow_mouse = null;
window.onmousedown = (event) => {
    if (follow_mouse && follow_mouse.target) {
        follow_mouse.target.removeAttribute("style")
        follow_mouse = null
    }
    follow_mouse = {
        target: null,
        event: event,
        old_state: null,
    }
    let srcElement = event.target
    if (srcElement.attributes?.dragable) {
        follow_mouse.target = event.target
        follow_mouse.old_state = event.target
    }
    else {
        while (srcElement && srcElement.attributes && srcElement.attributes.dragable == undefined) {
            srcElement = srcElement.parentNode
        }
        if (srcElement.attributes?.dragable) {
            follow_mouse.target = srcElement 
            follow_mouse.old_state = srcElement
        }
    }
}

let do_attach = (dragged, _static) => {
    dragged.target.style.position = dragged.target.style.oldposition
    _static.append(dragged.target)
}

let check_attachable = (elem) => {
    if (elem.length > 1) {
        for (let _elem of elem) {
            let __temp = _elem
            let flag = 0
            while (__temp && __temp.attributes) {
                if (__temp.attributes?.attachable != undefined && elem.includes(__temp)) {
                    return __temp;
                }
                __temp = __temp.parentNode
            }
        }
    } else {
        return elem[0]
    }

}
window.onmouseup = (event) => {
    let elem_under = document.elementsFromPoint(event.clientX, event.clientY)
    elem_under = check_attachable(elem_under)
    follow_mouse?.target?.removeAttribute("style")
    if (follow_mouse && follow_mouse?.target && elem_under?.attributes?.attachable) {
        do_attach(follow_mouse, elem_under)
    } else {
        console.log(follow_mouse)
        test = follow_mouse
    }
    
    follow_mouse = null
}

window.onmousemove = (event) => {
    if (follow_mouse && follow_mouse.target) {
        let __selection = window.getSelection()
        if(__selection){
            __selection.removeAllRanges()
        }
        let x = {
            position: "absolute",
            cursor: "pointer",
            top: `${event.clientY - follow_mouse.event.offsetY}px`,
            left: `${event.clientX - follow_mouse.event.offsetX}px`
        }
        Object.assign(follow_mouse.target.style, x)
    }
}



window.onload = load_all;
