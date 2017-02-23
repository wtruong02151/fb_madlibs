$(document).ready(function() {
  particlesJS.load('particles-js', 'particles.json', function() {
  });

  window.setInterval(function() {
    $.get('/getAdLibs', function(data) {
      $("#adlib-container").append("<p class='adlib'>" + data + "</p>")
    });
  }, 3000);

  $("#add-word-button").click(function() {
    var wordToAdd = $(".input-group").find('input')[0].value

    $.ajax({
      url: "/addWord",
      type: "POST",
      data: JSON.stringify({word: wordToAdd}),
      contentType: "application/json; charset=utf-8",
      dataTyp: "json",
      success: function() {
        // $("#add-word-success").show(400)
        //
        // setTimeout(function() {
        //     $("#add-word-success").hide(1000)
        // }, 2000);

      }
    });

  });

});
