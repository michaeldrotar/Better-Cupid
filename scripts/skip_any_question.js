core.RegisterLoadingProcess("skip_any_question", function() {
  
  core.ProcessElement(document.getElementById("question_form"), function() {
    var qid = this.querySelector("input[name=qid]").value;
    var oldSkip = this.querySelector(".skip");
    if ( oldSkip ) {
      oldSkip.parentNode.parentNode.removeChild(oldSkip.parentNode);
    }
    
    var button_holder = document.getElementById("buttons");
    
    var link = document.createElement("a");
    link.href = "#";
    link.id = "skipquestionbtn";
    link.innerHTML = "Skip";
    link.addEventListener("click", function(e) {
      e.preventDefault();
      document.getElementById("skipquestion").submit();
    })
    
    var btn = document.createElement("p");
    btn.addClass("btn small white skip");
    btn.appendChild(link);
    
    var container = document.createElement("div");
    container.addClass("set");
    container.appendChild(btn);
    container.appendTo(button_holder);
    
    var qid_input = document.createElement("input");
    qid_input.type = "hidden";
    qid_input.name = "qid";
    qid_input.value = qid;
    
    var submit_input = document.createElement("input");
    submit_input.type = "hidden";
    submit_input.name = "submit2";
    submit_input.value = "1";
    
    var form = document.createElement("form");
    form.action = "/questions/ask";
    form.method = "post";
    form.id = "skipquestion";
    form.setStyle("display: none");
    form.appendChild(qid_input);
    form.appendChild(submit_input);
    form.appendTo(button_holder);
  })
})