export const uniqueId = () => {
    return (
        Date.now().toString(36) +
        Math.floor(
            Math.pow(10, 12) + Math.random() * 9 * Math.pow(10, 12),
        ).toString(36)
    );
};

export const bytesToSize = (byteVal: number) => {
    const units=["Bytes", "KB", "MB", "GB", "TB"];
    let counter=0;
    const kb= 1024;
    let div= byteVal;
    while(div >= kb){
        counter++;
        div= div/kb;
    }
    return div.toFixed(1) + " " + units[counter];
}