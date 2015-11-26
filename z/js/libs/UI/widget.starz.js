
$.widget.create("$.widget.starz",function(){
    $d.css.addRules(
        {".star-icon" : "background:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAEdUlEQVR42q1Ue1BUVRg/391ld1kklmUf8ghYKcjhsVZSzdiU4VJMoFGOUf1TTTM0Yj56qZXmZEND+UjMcZpMGicmTc1mSiJQKI1KDBIpHpEuGULALiy7LPu6e8/p3HNXwopHyTf3nvPd2e98v9/3O9+3gP6DHd1qvleujLhQuOE760zPwEwDq3ctuiP7zrsafjn3Q4ufyG/LKf4SzyrAyd0LD+YUlTwyOvAr/qa23lLwQuNXswZQvetWk9l8Y0ds2u1KQoKk7sjBqtx1Py6dNYC63RnbFhfkPc+FqYAgILbuzuBPrd1myzNNHdcMULPHHJlq0v2ePD9Ng4BjRwgWUN3xU3tz17atumaAU+/OX7do8cK3OTkQoEYILYLa5Qs9nq6L9iTLqvND/wugpjwzXKlCCQlxUbXzUo3JNJRI8eIOCGMOfV17rlypCn/d5eRd+evbgv8KsH+l4f4IFZcJCkVcTMycOJ5w8Xq9KlYTrdBp9WpVlFYtByTQSLiKj4gW8AGx/+EKDNs8bsewZ9Dr8ff6PP4+3uftdYz4+lRqeRW0HzDjlKwYUVl6BDMRRK2BA4kt3QCN+xDKfWUBEhyjjeVCRAjQk6KJIRxgAcgH+y43wHvFurJlD93wooZisKTAtBZzhXxOkhKYNBIA5UBwABHeQbUKiFnpNwaCCd0wDeCgtUkYaGp1rmA1V5QY1lryUrYbYrFcLOUvAOoz2ceZs50xpi8Sb5wZTYolHyEV+v40bx1yeAqKdgx3jou6r8SwwmKZd2BuAg6ntBhZlpc9MC4/CdioHB7JJ+JLF0zYjtF16Mxpf3PvkLfgifKh/n900SebEpZkZMUeTkziohHime6hu5WY+wcptlciKgEAE4xWgEEHJ094aggEi5aXDjgnbdPPykwLzJnGKn1MMI5SDUUAY44EFxOKXOkkElrkRtTUzB9yugNPFm7p8007B43vp27OzJq7FfNO1hNEcAPxD7A7GM/PHMIqCBATaml3xuY+1zMwo0Grfyf9aPbNyuUIB1ka7O2mFygQ+BsAa1OxBEUyamgcuW/pK/0npgX49DUTFz830pqWhpNYHn6EUhy8KnziIIh9Lw83ooZvfZvytwyWTgtwaENCYvYt+otafYBOsNgwv9EuCTClgJPRSrA0B6FBk646DDWe1x3P39yzbFqAipX6woLC5GNymYcNkTBmRSALAyxLJB1WrtmokyUbokdiBG8/Yn9KIawuq7HP7vAlFZYOC1MCVK42vJH/4PUvYcFH5XHSEjBq71Rc6reNbozWqY/wQaz1e/GrWTepn9ZE2sIE3s3kGnZohZYOX+qjO93WKQGObYyvuztHcw/iwsDaOTba9rNth2KO7K3Htg95J8Z9+Gx0uiZcvjMjHSxqpQN4QQ1f1PiKiiv8hycFePPhSEhJiujKyNSYzp6xf8wj9PJTe+2X0CRWuSYKxtz+B+INirL0dC7t8+qx9Ws+4rdNWcGex6MWUFkUqytHz6IZWkWxSmW3BfM0Wll98X6/a+JvfwIl2TJ26yBP7wAAAABJRU5ErkJggg==)",
            ".starz" : "position:relative;height:24px;width:120px;",
            ".starz .star-icon" : "position:absolute;left:0;top:0;width:100%;height:100%;",
            ".starz .star-icon-shadow" : "opacity:.3;",
            ".starz .star-icon-val" : "width:20%;-webkit-transition:all .5s;transition:all .5s;"
        })
    var ell=$d("<div class='starz'><div class='star-icon star-icon-shadow'></div><div class='star-icon star-icon-val'></div><br/> <br/><output></output></div>")

    var ths=this;
    ell.addEventListener("click",function(ev){
        var dif=(ev.x-this.getBoundingClientRect().left)
        if(dif>0){  var val=(dif/24)//Math.ceil
            if(!ths.config.allowfractions){val=Math.ceil(val)}
            ths.value=val
            this.querySelector(".star-icon-val").style.width=(val*24)+"px"
            this.querySelector("output").textContent=val.toFixed(1)
        }
    })
    return ell
})