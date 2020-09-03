fetch("/user").then(async res => {
    if (res.status === 200) {
        const user = await res.json();
        document.querySelector(".signedIn span").innerText = user.nickname;
        document.querySelector(".signedIn").style.display = "block";
    } else {
        document.querySelector(".signedOut").style.display = "block";
    }
});