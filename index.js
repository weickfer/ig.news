function sayHello() {
  return 'Hello';
}

function mocker(fn) {
  return {
    mockReturnValueOnce(data) {
      fn = () => data
    }
  }
}

mocker(sayHello).mockReturnValueOnce({
  name: 'John'
})

console.log(sayHello())