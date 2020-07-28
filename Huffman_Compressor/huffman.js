import { BinaryHeap } from './heap.js';

export { HuffmanCoder }

class HuffmanCoder{

    // 0(Left) + 1(Right)
    // \' a
    // recursive function with base case
    stringify(node){
        if(typeof(node[1])==="string"){
            return '\''+node[1];
        }

        return '0' + this.stringify(node[1][0]) + '1' + this.stringify(node[1][1]);
    }

    // 2 <= 1 => 3
    // left child of 1 is 2
    // right child of 1 is 3

    // for compression => modify is false
    // for decompression => modify is true
    // convert node -> ['0,node']
    display(node, modify, index=1){
        if(modify){
            node = ['',node];
            if(node[1].length===1)
                node[1] = node[1][0];
        }

        if(typeof(node[1])==="string"){
            return String(index) + " = " + node[1];
        }

        let left = this.display(node[1][0], modify, index*2);
        let right = this.display(node[1][1], modify, index*2+1);
        let res = String(index*2)+" <= "+index+" => "+String(index*2+1);
        return res + '\n' + left + '\n' + right;
    }

    // huggman tree from code -> hufffman tree actual
    destringify(data){
        let node = [];
        // leaf node
        // here we have the importance of '
        if(data[this.ind]==='\''){
            this.ind++;
            node.push(data[this.ind]);
            this.ind++;
            return node;
        }

        // internal node
        // 0('a) 1(0'b1'c)
        this.ind++;
        let left = this.destringify(data);
        node.push(left);
        this.ind++;
        let right = this.destringify(data);
        node.push(right);

        return node;
    }

    // it is basically a dfs
    getMappings(node, path){
        // leaf
        if(typeof(node[1])==="string"){
            this.mappings[node[1]] = path;
            return;
        }

        // except leaf
        this.getMappings(node[1][0], path+"0");
        this.getMappings(node[1][1], path+"1");
    }

    encode(data){

        this.heap = new BinaryHeap();

        // store frequency count
        const mp = new Map();
        for(let i=0;i<data.length;i++){
            if(data[i] in mp){
                mp[data[i]] = mp[data[i]] + 1;
            } else{
                mp[data[i]] = 1;
            }
        }

        for(const key in mp){
            this.heap.insert([-mp[key], key]);
        }

        // creating huffman tree
        while(this.heap.size() > 1){
            const node1 = this.heap.extractMax();
            const node2 = this.heap.extractMax();

            const node = [node1[0]+node2[0],[node1,node2]];
            this.heap.insert(node);
        }
        const huffman_encoder = this.heap.extractMax();

        // a -> 0
        // b -> 01
        // c -> 11
        this.mappings = {};
        this.getMappings(huffman_encoder, "");

        // for abcaaab -> 0 01 11 0 0 0 01
        let binary_string = "";
        for(let i=0;i<data.length;i++) {
            binary_string = binary_string + this.mappings[data[i]];
        }

        // we have to store back those bits in computer
        // so need to convert 8 bits to 
        // this code gives the padding of remaining 8 bits
        let rem = (8 - binary_string.length%8)%8;
        let padding = "";
        for(let i=0;i<rem;i++)
            padding = padding + "0";
        binary_string = binary_string + padding;

        // conveting 8 bits each to a charcater
        // and store in result
        let result = "";
        for(let i=0;i<binary_string.length;i+=8){
            let num = 0;
            for(let j=0;j<8;j++){
                num = num*2 + (binary_string[i+j]-"0");
            }
            result = result + String.fromCharCode(num);
        }

        // not only we have reduced the size of text
        // but also made it encripted
        // rem -> no of padding bits
        // result -> data to be decrypted
        // huffman_encoder -> which will help me to decrypt
        let final_res = this.stringify(huffman_encoder) + '\n' + rem + '\n' + result;
        let info = "Compression Ratio : " + data.length/final_res.length;
        info = "Compression complete and file sent for download" + '\n' + info;
        return [final_res, this.display(huffman_encoder, false), info];
    }

    decode(data){
        // tree rem encoded_data
        // special case -> when \n is already a character
        // \n will also be in tree so i handle that with 
        // data length = 4
        data = data.split('\n');
        if(data.length===4){
            // Handling new line
            data[0] = data[0] + '\n' + data[1];
            data[1] = data[2];
            data[2] = data[3];
            data.pop();
        }

        // we need to get the tree back
        // to get the data back 
        this.ind = 0;
        const huffman_decoder = this.destringify(data[0]);
        const text = data[2];

        // Encoded text to binary string
        // converting each character to binary string
        let binary_string = "";
        for(let i=0;i<text.length;i++){
            let num = text[i].charCodeAt(0);
            let bin = "";
            for(let j=0;j<8;j++){
                bin = num%2 + bin;
                num = Math.floor(num/2);
            }
            binary_string = binary_string + bin;
        }

        // Removing the padding padding variable
        binary_string = binary_string.substring(0,binary_string.length-data[1]);

        console.log(binary_string.length);

        // Binary String + Huffman Tree -> Origianl Data
        // get 0 -> go to left
        // get 1 -> go to right
        // get string means we are at leaf
        let res = "";
        let node = huffman_decoder;
        for(let i=0;i<binary_string.length;i++){
            if(binary_string[i]==='0'){
                node = node[0];
            } else{
                node = node[1];
            }

            if(typeof(node[0])==="string"){
                res += node[0];
                node = huffman_decoder;
            }
        }

        // returning decoded text , tree structure ,
        // and extra info
        let info = "Decompression complete and file sent for download";
        return [res, this.display(huffman_decoder, true), info];
    }
}