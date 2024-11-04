const formBtn = document.querySelector('.formSubmitBtn')
const email = document.querySelector('.email')
const password = document.querySelector('.password')

formBtn.addEventListener('click', () => {
    const payload = {
        email: email.value,
        password: password.value
    }

    fetch(`/form`, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: {
            "Content-Type": "application/json"
        }
    })
})