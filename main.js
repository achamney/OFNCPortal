$("#passwordButton").click(()=>{
    login();
});
const loginEnter = $("body").on('keypress',(e) => {
    if(e.which == 13) {
        loginEnter.off();
        login();
    }
});
function login(){
    $('#dbInfoOverlay').hide();
    var lastFetchedMemberInfo = localStorage.getItem("membershipInfo") || '{"lastUpdated":100}';
    lastFetchedMemberInfo = JSON.parse(lastFetchedMemberInfo);
    lastFetchedMemberInfo.lastUpdated = new Date(lastFetchedMemberInfo.lastUpdated);
    if (!oneHourAgo(lastFetchedMemberInfo.lastUpdated)){
        var spinner = $("<div class='overlay'><div class='lds-roller'><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div></div>").appendTo($('body'));
        $.get("https://achamney.pythonanywhere.com/0e4270d8-3eb6-11ed-acaa-0ae52db41295").then((res)=>{
            spinner.remove();
            var json = JSON.parse(res);
            json.lastUpdated = new Date();
            localStorage.setItem("membershipInfo",JSON.stringify(json));
            decode(json);
            window.membershipInfo = json;
        }).catch((err) => {
            spinner.remove(); 
            throw new Error(err.message ? err.message : `{"success":false}`)
        });
    } else {
        decode(lastFetchedMemberInfo);
        window.membershipInfo = lastFetchedMemberInfo;
    }
}
$("#clearInputsButton").click(()=>{
    $("#lastNameInput").val("");
    $("#emailInput").val("");
    $("#results").empty();
})
$("#lastNameInput").on("keyup, input",(event)=>{
    if (event.target.value.length >= 2) {
        displayMemberInfo(membershipInfo, "Surname1", "Surname2", event.target.value);
    }
});
$("#emailInput").on("keyup, input",(event)=>{
    if (event.target.value.length >= 2) {
        displayMemberInfo(membershipInfo, "Email", "Email2", event.target.value);
    }
});
const oneHourAgo = (date) => {
    const hour= 1000 * 60 * 60;
    const hourago= Date.now() - hour;

    return date > hourago;
}
function displayMemberInfo(memberInfo, filterKey1, filterKey2, filterValue){
    var memberContainer = $("#results");
    memberContainer.empty();
    memberContainer.append($(`<div>Membership info last updated ${memberInfo.timeOfUpdate}</div><br/>`));
    filterValue = filterValue.toUpperCase();
    for (var member of memberInfo.members) {
        if (~member[filterKey1].toUpperCase().indexOf(filterValue) || (member[filterKey2] && ~member[filterKey2].toUpperCase().indexOf(filterValue))) {
            memberContainer.append($(`<div><h3>${member.Surname1} <small>${member.Email}</small></h3></div>`));
        }
    }
}
function decode(memberInfo) {
    var secret = $("#password").val();
    var secretLength = secret.length;
    for (var i=0;i<32-secretLength;i++)
        secret = `${secret}0`;
    var fernSecret = new fernet.Secret(btoa(secret));
    for (var member of memberInfo.members) {
        for (var memberKey in member) {
            if (member[memberKey] == "None")
                continue;
            var stripBinary = member[memberKey].substr(2,member[memberKey].length - 3);
            var token = new fernet.Token({
                secret: fernSecret,
                token: stripBinary,
                ttl: 0
            });
            member[memberKey] = token.decode();
        }
    }
}