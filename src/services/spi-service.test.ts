
it('Test 1. Test how buffer method will read input', () => {

    // 1111 1111 0100 1100
    // FF4C
    const buf = Buffer.from([0b11111111, 0b01001100]);
    console.log(buf)
    const number = buf.readInt16BE(0)
    expect(number).toBe(-180);
});