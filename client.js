let cmnts = document.getElementById("cmnts");
let btn = document.getElementById("cmnt-btn");
let ip = document.getElementById("cmnt-ip");

btn.addEventListener('click',()=>{
    console.log("clicked");
    let newComment = document.createElement("div");
    newComment.innerHTML = `<p>${ip.value}</p>`;
    cmnts.appendChild(newComment);
    fetch("http://localhost:3000/comment", {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({path:'./uploads/2.pdf',comment:ip.value})
      })
      .then(response => {
        response.json()
      })
      .catch(error => {
        console.log(error)
      });
      
    ip.value = "";
})


function getNote(){
    fetch('http://localhost:3000/download/2.pdf')
    .then(response => response.blob())
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      const iframe = document.getElementById('pdf');
      iframe.src = url;
      iframe.style.height = screen.height - 100 +"px";
    })
    .catch(error => console.error(error));
}

getNote()

let comments

function setComments(){
    for(let i=0;i<comments.length;i++){
        let newComment = document.createElement("div");
        newComment.innerHTML = `<p>${comments[i]}</p>`;
        cmnts.appendChild(newComment);
    }
}

function getComments(){

    fetch('http://localhost:3000/comments/2.pdf')
    .then(response => response.json())
    .then(data => {
        comments = data
        console.log(comments)
    })
    .then(()=>setComments())
    .catch(err => console.log(err))
}
getComments()


