import React, {useEffect, useRef, useState} from "react";
import {Web3Storage} from 'web3.storage/dist/bundle.esm.min.js';
import env from "react-dotenv";
import {
    Box,
    Button,
    chakra,
    Flex,
    FormControl,
    FormHelperText,
    FormLabel,
    Image,
    Input,
    Stack,
    Switch,
    Textarea,
    useColorModeValue,
    useCheckboxGroup,
    VisuallyHidden,
    CheckboxGroup,
    HStack
} from "@chakra-ui/react";
import WalletConnectProvider from "@walletconnect/web3-provider";
import Web3Modal from "web3modal";
import {ethers} from "ethers";
import ContractAbi from "../contracts/CryptoDev";
import nouser from "../nouser.svg";
import CheckboxCard from "../components/CheckboxCard";

export default function Component() {
    const contractAddress = env.CONTRACT_ADDRESS;
    const imageInput = React.createRef();
    const imageInputDisplay = React.createRef();
    const portfolioImage = React.createRef();
    const submitButton = useRef();
    const w3sClient = new Web3Storage({ token: env.WEB3_STORAGE_TOKEN });
    const [signer, setSigner] = useState(null);
    const [walletAddress, setWalletAddress] = useState(0);
    const [contract, setContract] = useState(null);
    const [tokenId, setTokenId] = useState(0);
    const [portfolioImageSrc, setPortfolioImageSrc] = useState(nouser);

    // Form Fields
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [jobSearch, setJobSearch] = useState(true);
    const [skills, setSkills] = useState([]);
    const [projects, setProjects] = useState();

    // Web3 Skills
    const skillOptions = ["Solidity", "Hardhat", "Truffle", "Node", "React", "Ethers Js", "UI/UX"];
    const onSelectedChange = (index) => {
        setSkills((prevState) => {
            if (!prevState.includes(index)) {
                prevState.push(index);
            }
            return prevState;
        });
    };
    const { getCheckboxProps } = useCheckboxGroup({
        onChange: onSelectedChange
    });

    // Connect Wallet
    useEffect(() => {
        async function connectSigner() {
            const providerOptions = {
                walletconnect: {
                    package: WalletConnectProvider,
                    options: {
                        infuraId: env.INFURA_ID,
                    },
                },
            };

            const web3Modal = new Web3Modal({
                network: "rinkeby", // optional
                cacheProvider: true, // optional
                providerOptions // required
            });
            const connectWeb3 = await web3Modal.connect();
            const newProvider = new ethers.providers.Web3Provider(connectWeb3);
            const newSigner = newProvider.getSigner();
            const newWalletAddress = await newSigner.getAddress();
            const newContract = new ethers.Contract(contractAddress, ContractAbi, newSigner);
            const tokenId = await newContract.getTokenIdByOwner(newWalletAddress);
            setSigner(newSigner);
            setWalletAddress(newWalletAddress);
            setContract(newContract);
            setTokenId(tokenId.toNumber());
        }
        connectSigner();
    });

    // Handle Form Submit
    const handleSubmit = async (event) => {
        event.preventDefault();
        let imageInputCurrent = imageInput.current;
        const imageUploaded = imageInputCurrent.files[0];
        const projectsBlob = new Blob([projects], {type : 'text/markdown'});
        const projectsFile = new File([projectsBlob], 'projects.md');
        // Pack files into a CAR and send to web3.storage
        const imageGroupCid = await w3sClient.put([imageUploaded, projectsFile], {
            name: 'Crypto Devs Token Mint',
            maxRetries: 3
        });
        const fileRes = await w3sClient.get(imageGroupCid);
        const files = await fileRes.files();
        const getActualCid = (filename, fileList) => {
            for (let i = 0;i < fileList.length;i++) {
                if (fileList[i].name === filename) {
                    return fileList[i].cid;
                }
            }
        };

        // Image Links
        const ipfsImageHttpLink = "http://" + getActualCid(imageUploaded.name, files) + ".ipfs.dweb.link";
        const ipfsImageLink = "ipfs://" + getActualCid(imageUploaded.name, files);
        // Projects MD Link
        const ipfsProjectsLink = "ipfs://" + getActualCid("projects.md", files);

        const metadataAttributes = [];
        for (let i = 0;i < skills.length;i++) {
            metadataAttributes.push({
                "value": skills[i]
            });
        }
        metadataAttributes.push({
            "trait_type": "Web3 Dev Job Status",
            "value": jobSearch ? "Looking" : "Not Looking"
        });
        const metadata = {
            image: ipfsImageLink,
            name: name,
            description: description,
            projects_url: ipfsProjectsLink,
            attributes: metadataAttributes
        };
        const metadataBlob = new Blob([JSON.stringify(metadata)], {type : 'application/json'});
        const metadataFile = new File([metadataBlob], 'metadata.json');

        const metadataCid = await w3sClient.put([metadataFile], {
            name: 'Metadata',
            maxRetries: 3
        });
        const metadataFileRes = await w3sClient.get(metadataCid);
        const metadataFiles = await metadataFileRes.files();
        // Token Metaddata IPFS Link
        const ipfsMetadataLink = "ipfs://" + getActualCid("metadata.json", metadataFiles);
        // Update Portfolio Image
        setPortfolioImageSrc(ipfsImageHttpLink);
        // Mint
        const mintTx = await contract.mint(ipfsMetadataLink);
    }

    // Handle portfolio image changing
    const handleImageChange = (event) => {
        imageInputDisplay.current.value = event.target.value.replace(/^.*[\\\/]/, '');
    }

    // Render
    return (
        <Box bg={useColorModeValue("gray.50", "inherit")} p={10}>
            <Box mb={5}>{walletAddress
                ? "Connected Wallet: " + walletAddress
                : "Please Connect Wallet."}</Box>
            <Box  minW={"800px"}>
                <chakra.form
                    method="POST"
                    shadow="base"
                    rounded={[null, "md"]}
                    overflow={{ sm: "hidden" }}
                    onSubmit={handleSubmit}
                >
                    <Stack
                        px={4}
                        py={5}
                        bg={useColorModeValue("white", "gray.700")}
                        spacing={6}
                        p={{ sm: 6 }}
                    >

                        <Flex alignItems="center" mt={1}>
                            <FormControl>
                                <FormLabel
                                    fontSize="sm"
                                    fontWeight="md"
                                    color={useColorModeValue("gray.700", "gray.50")}
                                >
                                    Portfolio Image
                                </FormLabel>
                                <Image
                                    boxSize="300px"
                                    src={portfolioImageSrc}
                                    key={portfolioImageSrc}
                                    ref={portfolioImage}
                                    alt="Portfolio"
                                />
                                <chakra.label
                                    htmlFor="image-upload"
                                    cursor="pointer"
                                    rounded="md"
                                    fontSize="md"
                                    color={"brand.200"}
                                    pos="relative"
                                    _hover={{
                                        color: useColorModeValue("brand.400", "brand.300"),
                                    }}
                                >
                                    <span>Add a Portfolio Image</span>
                                    <VisuallyHidden>
                                        <input
                                            id="image-upload"
                                            name="image-upload"
                                            type="file"
                                            ref={imageInput}
                                            onChange={handleImageChange}
                                        />
                                    </VisuallyHidden>
                                </chakra.label>
                                <Input
                                    type="text"
                                    name="portfolio-image-name"
                                    id="first_name"
                                    mt={1}
                                    focusBorderColor="brand.400"
                                    shadow="sm"
                                    size="sm"
                                    w="full"
                                    rounded="md"
                                    disabled="disabled"
                                    placeholder="Upload New Portfolio Image"
                                    textAlign="center"
                                    ref={imageInputDisplay}
                                />
                            </FormControl>
                        </Flex>


                        <FormControl>
                            <FormLabel
                                fontSize="sm"
                                fontWeight="md"
                                color={useColorModeValue("gray.700", "gray.50")}
                            >
                                Name
                            </FormLabel>
                            <Input
                                type="text"
                                focusBorderColor="brand.400"
                                rounded="md"
                                value={name}
                                onChange={e => setName(e.target.value)}
                            />
                        </FormControl>

                        <FormControl mt={1}>
                            <FormLabel
                                fontSize="sm"
                                fontWeight="md"
                                color={useColorModeValue("gray.700", "gray.50")}
                            >
                                Brief Summary
                            </FormLabel>
                            <Textarea
                                mt={1}
                                rows={3}
                                shadow="sm"
                                focusBorderColor="brand.400"
                                value={description}
                                onChange={e => setDescription(e.target.value)}

                            />
                            <FormHelperText>
                                Short description for your profile. Markdown is allowed.
                            </FormHelperText>
                        </FormControl>

                        <FormControl>
                            <FormLabel
                                fontSize="sm"
                                fontWeight="md"
                                color={useColorModeValue("gray.700", "gray.50")}
                            >
                                Web3 Dev Skills
                            </FormLabel>
                            <CheckboxGroup
                                colorScheme="brand"
                                value={skills}
                                onChange={e => setSkills(e.target.value)}
                            >
                                <HStack spacing={8}>
                                    {skillOptions.map((value, index) => {
                                        const checkbox = getCheckboxProps({ value });
                                        return (
                                            <CheckboxCard
                                                {...checkbox}
                                                key={value}
                                                onChange={() => onSelectedChange(value)}
                                                isChecked={skills.includes(value) || false}
                                            >
                                                {value}
                                            </CheckboxCard>
                                        );
                                    })}
                                </HStack>
                            </CheckboxGroup>
                        </FormControl>

                        <FormControl display="flex" alignItems="center">
                            <FormLabel htmlFor="job-search" mb="0">
                                Looking for Job in Web3 Development?
                            </FormLabel>
                            <Switch
                                id="job-search"
                                defaultChecked={true}
                                checked={jobSearch}
                                onChange={e => setJobSearch(e.target.checked)}
                            />
                        </FormControl>

                        <FormControl mt={1}>
                            <FormLabel
                                fontSize="sm"
                                fontWeight="md"
                                color={useColorModeValue("gray.700", "gray.50")}
                            >
                                Detailed Portfolio with Project Links
                            </FormLabel>
                            <Textarea
                                mt={1}
                                rows={3}
                                shadow="sm"
                                focusBorderColor="brand.400"
                                value={projects}
                                onChange={e => setProjects(e.target.value)}

                            />
                            <FormHelperText>
                                Use this section to highlight previous projects. Markdown is allowed.
                            </FormHelperText>
                        </FormControl>
                    </Stack>
                    <Box
                        px={{ base: 4, sm: 6 }}
                        py={3}
                        bg={useColorModeValue("gray.50", "gray.900")}
                        textAlign="right"
                    >
                        <Button
                            ref={submitButton}
                            loadingText={tokenId > 0 ? "Updating NFT..." : "Minting NFT..."}
                            colorScheme="brand"
                            type="submit"
                            _focus={{ shadow: "" }}
                            fontWeight="md"
                        >
                            {tokenId > 0 ? "Update NFT" : "Mint New NFT"}
                        </Button>
                    </Box>
                </chakra.form>
            </Box>
        </Box>
    );
}