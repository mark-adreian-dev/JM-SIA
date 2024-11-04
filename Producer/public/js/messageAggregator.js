const messageAggregatorBtn = document.querySelectorAll('.aggregator-submit')
const textArea = document.querySelectorAll('.text-area-aggregator')


const handleSubmitMessageAggregator = (textAreaIndex) => {
    
    const payload = {
        message: textArea[textAreaIndex].value 
    }

    fetch("/aggregator", {
        method: "POST",
        body: JSON.stringify(payload),
        headers: {
            "Content-Type": "application/json"
        }
    })
}

messageAggregatorBtn.forEach((button, index) => {
    button.addEventListener('click', () => {
        handleSubmitMessageAggregator(index)
    }, false)
});