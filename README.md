Lilhx is a to-be frontend framework that introduces a reactive state management system along with features reminiscent of htmx. This framework empowers developers to build dynamic and responsive web applications effortlessly. Here's an elaborate exploration of some key features:

## Features:

### Reactive States:
Lilhx incorporates a reactive state management system, enabling developers to effortlessly handle and manipulate the state of their web applications. This reactive approach ensures that changes in state trigger automatic updates, providing a seamless and efficient user experience.


### Event Handling:
#### i. Click Events:
   - **Verbs:**
     1. **Fetch:**
        - Attribute: `fetch="url"`
        - Method: `method="get"` (default) or any HTTP method
        - **Actions:**
            - `swap_inner`: Replace inner content
            - `swap_outer`: Replace the entire element
            - `append`: Append content
            - `prepend`: Prepend content
            - `n_swap`: Replace the nth child element (`n_swap=1` for the first child, `n_swap=n` for the nth child)
            - `callback`: Execute a custom function (`function_name`) on successful fetch response. The function receives three parameters: `element`, `target`, and `fetch_response`. The `fetch_response` is expected to be a text containing HTML/markup for the next state or the body of an element.

### ii. StateManagement
   - **Stateful Actions:**
        - *Save State:* Use `save_state` attribute to persist the current state in the body.
        - *Load State:* Use `load_state` attribute to load a previously saved session state.
#### iiI. Drag Events:
   - **Verbs:**
        1. **Drag:**
            - Attribute: `dragable`
            - Destination: `attach_to="target"` requires attachable target,if not provided will attach to any attachables
            - Float :- `float` ; if set this elemnt will float and will be direct child of `<body>` with `absolute` position
                    if it not dragged into any attachables,it also doesnot preserves the old state of the element,
                    like it's position,parent,siblings, other feature like attributes,classname and inner/outerHTML 
                    are preserved
        2. **Attachable:**
            - Attribute: `attachable`
            - **Action:**
                - `swap_inner` :-  replace the innerHTML content of `attachable` with `dragable` element
                - `swap_outer` :- replace the outerHTML content of `attachable` with `dragable` element
                - `append` :-   inserts at end of the attachable div/block
                - `prepend` :-  inserts atfirst of the attachable div/block
                - `before_child` :- inserts before the child the mouse is on
                - `after_child` :-  inserts after the child the mouse is on
            - Tigger:`callback` get's tiggred when dragable is draged to `this`
   - **Stylying**
        - `[dragable]`:- for designing the dragable components
        - `[moving]` :-  for styling when the component is in middle of moving or currenlty moving/active
        >PS:- their will be a style element added by lilhx in your rendred HTML,
        >with `id` "lil_hx_stylesheet", which can be removed to remove the default 
        >styling by lilhx

        - `[nostyle]`:- put this in body/html tag to remove the lilhx style,if you don't know much about other way
        


#### ii. Other Working Features:
   - *Ongoing Development:* Lilhx is a work in progress and aims to provide a synergy of features from htmx and React. Stay tuned for more exciting updates and enhancements.

Lilhx is designed to streamline the development process, offering a harmonious blend of reactivity and powerful event handling. It caters to the needs of developers who seek a modern and efficient framework for crafting dynamic web applications.

<! This is generated by prompting ChatGpt 3.5!>