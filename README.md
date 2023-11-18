# Eventes
        click
            . verbs
                1. fetch:- fetch="url"
                        method = "get"/default get
                . actions
                    1. swap_inner
                    2. swap_outer
                    3. append
                    4. prepend
                    5. n_swap:-    n_swap=1; 1st child
                                   n_swap=n; nth child
                    6. callback :- costume actions=> function_name(element, target ,fetch_response)
                                    fetch_response will be a text:-
                                        if valid then the text will be html/markup for next state
                                        or element body
                         handler:- handler="function_name" callback function to handle the state chnage
                2. statefull:- change the state of the element
                    [
                        To change th state put a handler in a child element that 
                        can be used to tigger the event change
                    ]
                    * save_state :- put this attribute in boady to load session state
                    * load_state :- ----' '----' '-------' '------' '-----' '--------
