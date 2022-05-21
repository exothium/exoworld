import { getStarknet } from "@argent/get-starknet";



const connectStarknet = async () => {
    const starknet = getStarknet();

    // May throw when no extension is detected, otherwise shows a modal prompting the user to download Argent X.
    const [userWalletContractAddress] = await starknet.enable({ showModal: true })

// Check if connection was successful
    if(starknet.isConnected) {
        // If the extension was installed and successfully connected, you have access to a starknet.js Signer object to do all kinds of requests through the user's wallet contract.
        //alert('oh yeah connected')
        console.log('oh yeah connected')
    } else {
        // In case the extension wasn't successfully connected you still have access to a starknet.js Provider to read starknet states and sent anonymous transactions
        //alert('oh no yeah not connected')
        console.log('oh yeah connected')
    }

    alert('hey');
}

connectStarknet();
