const formBtn2 = document.querySelector('.formSubmitBtn2')
const email2 = document.querySelector('.email2')
const password2 = document.querySelector('.password2')
const region = document.querySelector('.region')

formBtn2.addEventListener('click', () => {
    const payload = {
        email: email2.value,
        password: password2.value,
        region: region.value
    }
    fetch(`/form2`, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: {
            "Content-Type": "application/json"
        }
    })
    .then(response => response.json())
    .then(response => console.log(response))
})
