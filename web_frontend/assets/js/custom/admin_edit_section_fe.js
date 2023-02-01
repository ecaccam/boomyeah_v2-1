(
function(){
    let toast_timeout = null;
    let saving_timeout = null;

    document.addEventListener("DOMContentLoaded", async ()=>{
        if(ux("#add_page_tabs_btn").html()){
            ux("#add_page_tabs_btn").on("click", addNewSectionContent);
        }

        await include("#main_navigation" , `../views/global/main_navigation.html`, `../assets/js/main_navigation.js`);

        initializeEditSectionEvents();
        initializeRedactor("#section_pages .tab_content");
    });
    
    function initializeEditSectionEvents(ux_target = null, callback = null){
        if(ux_target){
            ux_target.find(".section_page_tabs .add_page_btn").on("click", addNewTab);
            ux_target.find(".section_page_tabs .remove_tab_btn").on("click", removeSectionTab);
            bindOpenTabLink(ux_target);
    
            ux_target.findAll((".tab_title")).forEach((tab_title) => {
                ux(tab_title).on("keyup", (event) => {
                    onUpdateTabTitle(event);
                });
            });
        }
        else{
            ux(".section_page_tabs .add_page_btn").onEach("click", addNewTab);
            ux(".section_page_tabs .remove_tab_btn").onEach("click", removeSectionTab);
            ux(".section_page_content .tab_title").onEach("keyup", (event) => {
                onUpdateTabTitle(event);
            });
            bindOpenTabLink();
        }
    
        if(callback){
            callback();
        }
    }
    
    function saveTabChanges(section_page_tab){
        clearTimeout(saving_timeout);
        M.Toast.dismissAll();
        
        saving_timeout = setTimeout(() => {        
            clearTimeout(toast_timeout);
            section_page_tab.find(".saving_indicator").addClass("show");
        
            toast_timeout = setTimeout(() => {
                section_page_tab.find(".saving_indicator").removeClass("show");
                M.toast({
                    html: "Changes Saved",
                    displayLength: 2800,
                });
                
            }, 800);
        }, 480);
    }
    
    function onUpdateTabTitle(event){
        let tab_title = event.target;
        let section_page_tab = ux(tab_title.closest(".section_page_tab"));
        let tab_id = section_page_tab.attr("id");
        let tab_title_value = (tab_title.value.length > 0) ? tab_title.value : "Untitled Tab*";
        ux(`.page_tab_item[data-tab_id="${tab_id}"] a`).text(tab_title_value);
        
        if(tab_title.value.length > 0){
            saveTabChanges(section_page_tab);
        }
    }
    
    function bindOpenTabLink(ux_target = null){
        if(ux_target){
            /** For dynamically added sections */
            ux_target.findAll((".section_page_tabs .page_tab_item")).forEach((page_tab_link) => {
                ux(page_tab_link).on("click", (link_event) => {
                    openTabLink(link_event);
                });
            })
        } else {
            
            ux(".section_page_tabs .page_tab_item").onEach("click", (event) =>{
                openTabLink(event);
            });
        }
    }
    
    function openTabLink(event){
        let tab_item = event.target;
        let section_page_content = ux(tab_item.closest(".section_page_content"));
        let section_page_tabs_list = ux(tab_item.closest(".section_page_tabs"));
        let page_tab_item = tab_item.closest(".page_tab_item");
        let tab_id = ux(page_tab_item).attr("data-tab_id");
    
        section_page_tabs_list.findAll(".page_tab_item").forEach(element => element.classList.remove("active"))
        section_page_content.findAll(".section_page_tab").forEach(element => element.classList.remove("show"))
        
        setTimeout(() => {
            ux(page_tab_item).addClass("active");
            let active_tab = ux(`#${ tab_id }`).addClass("show");

            if(active_tab && active_tab.find("input.tab_title").html()){
                active_tab.find("input.tab_title").html().select();
            }
        });
    }
    
    function addNewSectionContent(event){
        event.preventDefault();
        let tab_id = `tab_${ new Date().getTime()}`;
        let section_pages = ux("#section_pages");
        let section_page_content = ux("#clone_section_page .section_page_content").clone();
        let section_page_tab = section_page_content.find(".section_page_tab");
        section_page_content.find(".page_tab_item").addClass("active");
        section_page_tab.addClass("show");
        section_pages.html().append(section_page_content.html());
        section_page_tab.html().id = tab_id;
        section_page_content.find(".section_page_tab .tab_title").html().select();
        section_page_content.find(".section_page_tabs .page_tab_item").html()
            .setAttribute("data-tab_id", tab_id);
        section_page_tab.find(".checkbox_label").attr("for", "allow_comments_"+ tab_id);
        section_page_tab.find("input[type=checkbox]").attr("id", "allow_comments_"+ tab_id);
        /** Rebind Event Listeners */
        initializeEditSectionEvents(section_page_content);
        initializeRedactor(`#${tab_id} .tab_content`);
    }
    
    function addNewTab(event){
        event.preventDefault();
        let tab_item = event.target;
        let add_page_tab = event.target.closest(".add_page_tab");
        let section_page_content = ux(tab_item.closest(".section_page_content"));
        let section_page_tabs_list = ux(tab_item.closest(".section_page_tabs"));
        let page_tab_clone = ux("#clone_section_page .section_page_tab").clone();
        let page_tab_item = ux("#clone_section_page .page_tab_item").clone();
        let tab_id = `tab_${ new Date().getTime()}`;
        page_tab_clone.html().id = tab_id;
        section_page_content.html().append(page_tab_clone.html());
        
        page_tab_clone.find(".checkbox_label").attr("for", "allow_comments_"+ tab_id);
        page_tab_clone.find("input[type=checkbox]").attr("id", "allow_comments_"+ tab_id);
        /** Insert New tab */
        section_page_tabs_list.html().append(page_tab_item.html());
        section_page_tabs_list.html().append(add_page_tab);
        page_tab_item.html().setAttribute("data-tab_id", tab_id);
        
        page_tab_item.find(".remove_tab_btn").on("click", removeSectionTab);
        page_tab_clone.find(".tab_title").on("keyup", (event) => {
            onUpdateTabTitle(event, section_page_tabs_list.findAll(".page_tab_item").length);
        });
        bindOpenTabLink(section_page_content);
        
        setTimeout(() => {
            initializeRedactor(`#${tab_id} .tab_content`);
            
            /** Auto click new tab */            
            page_tab_item.html().click();
        });
    }
    
    function removeSectionTab(event){
        event.stopPropagation();
    
        let remove_tab_btn = event.target;
        let tab_item = remove_tab_btn.closest(".page_tab_item");
        let section_page_content = remove_tab_btn.closest(".section_page_content");
        let section_page_tabs = remove_tab_btn.closest(".section_page_tabs");
        let tab_id = tab_item.getAttribute("data-tab_id");
        
        ux(`#${tab_id}`).html().remove();
        tab_item.remove();
        
        setTimeout(() => {
            if(ux(section_page_tabs).findAll(".page_tab_item").length === 0){
                section_page_content.remove();
            }else{
                ux(section_page_tabs).findAll(".page_tab_item")[0].click();
            }
        });
    }
    
    function initializeRedactor(selector){
        RedactorX(selector, {
            editor: {
                minHeight: '360px'
            }
        });

        document.querySelectorAll(".section_page_tabs").forEach((section_tabs_list) => {
            Sortable.create(section_tabs_list, {
                filter: ".add_page_tab"
            });
        });
    }
})();
