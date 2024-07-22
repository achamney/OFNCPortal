function makeModal(small) {
    var container = $(`<div class='overlay'><div class='overlay-inner ${small?"small":""}'></div></div>`).appendTo($("body"));
    var inner = container.find(".overlay-inner").on("mousedown",(e)=>e.stopPropagation());
    $("<button class='close'>x</button>")
        .click(()=>close(container))
        .appendTo(inner);
    $("body").addClass("no-scroll");
    
    container.on("mousedown",()=>close(container));
    return inner;
}
function close(container) {
    container.remove();
    if($(".overlay-inner").length == 0) {
        $("body").removeClass("no-scroll");
    }
}
