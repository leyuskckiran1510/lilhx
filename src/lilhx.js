"use strict";
let test = null;
let print = console.log
let STATE_FULL_ELEMENTS = {}
let STATES_VARS = { "lilx": 0 }
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
    print(e.style.animation)
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
        fetch_callback =(x,y,z)=>{
          fetch_swap(x,y,z)
          window[callback](x,y,z)
        }
    }
    
    if (url && method) {
        c_fetch(url, method, (x) => fetch_callback(elem, target, x), (x) => fetch_error(elem, x))
    } else {
        print("Url Not Provided for fetch")
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

let __handle_click = (srcElement) => {
    if (srcElement.attributes.fetch) {
        fetch_handler(srcElement)
    }
    else if (srcElement.attributes?.handler) {
        handle_handler(srcElement)
    }
    
    return -1;
    
}

let click_event = (event) => {
    let srcElement = event.srcElement;
    if (srcElement && srcElement.attributes.clickable) {
        __handle_click(srcElement)
    } else if (srcElement && srcElement.attributes.bubble) {
        while (srcElement 
               && srcElement.attributes.bubble 
               &&__handle_click(srcElement.parentNode) == -1) {
        srcElement = srcElement.parentNode
        }
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

let load_all = ({ srcElement }) => {
    let pointer = 0;
    if (document.body.attributes.load_state != undefined) {
        const storedDictionary = sessionStorage.getItem('STATES_VARS');
        if (storedDictionary) {
            STATES_VARS = JSON.parse(storedDictionary);
            Object.assign(window, STATES_VARS)
        } else {
            print("No saved State")
        }
    }
    let traverse = (srcElement) => {
        for (let child of srcElement?.childNodes) {
            if (child.attributes?.statefull) {
                STATE_FULL_ELEMENTS[pointer] ||= child.innerHTML
                child.setAttribute("index", pointer)
                pointer++;
                child.innerHTML = change_state(child.innerHTML)
            }
            traverse(child)
        }
    }
    traverse(srcElement)
}

window.onclick = click_event;
window.onload = load_all;
