import React from 'react';
import {
    Button,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    Flex,
    Tooltip,
    IconButton,
    Input,
    Text,
    useClipboard
} from '@chakra-ui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy } from '@fortawesome/free-solid-svg-icons';
import { faFacebook, faWhatsapp, faTwitter, faInstagram, faTelegramPlane } from '@fortawesome/free-brands-svg-icons';
import styles from '../styles/shareModal.module.css';

const ShareModal = ({ isOpen, onClose, recipeTitle, recipeLink }) => {
    const { onCopy, hasCopied } = useClipboard(recipeLink);
    const message = `Check out this recipe: ${recipeTitle} - ${recipeLink}`;

    const socialShareLinks = [
        { icon: faFacebook, label: 'Share on Facebook', url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(message)}` },
        { icon: faTwitter, label: 'Share on Twitter', url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(message)}` },
        { icon: faInstagram, label: 'Share on Instagram', url: `https://www.instagram.com/?url=${encodeURIComponent(message)}` },
        { icon: faWhatsapp, label: 'Share on WhatsApp', url: `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}` },
        { icon: faTelegramPlane, label: 'Share on Telegram', url: `https://t.me/share/url?url=${encodeURIComponent(message)}` }
    ];

    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader className={styles.modalHeader}>Share Modal</ModalHeader>
                <ModalCloseButton />
                <ModalBody className={styles.modalBody}>
                    <Text mb='4'>Share this link via</Text>
                    <Flex justify='space-between' mb='4'>
                        {socialShareLinks.map(({ icon, label, url }, index) => (
                            <Tooltip key={index} label={label} hasArrow>
                                <IconButton
                                    as='a'
                                    href={url}
                                    target='_blank'
                                    icon={<FontAwesomeIcon icon={icon} />}
                                    isRound
                                    size='lg'
                                    aria-label={label}
                                    variant='outline'
                                />
                            </Tooltip>
                        ))}
                    </Flex>

                    <Flex justify='center' mb='2'>
                        <Text>Or copy link</Text>
                    </Flex>
                    <Flex className={styles.copyLinkContainer} align='center'>
                        <FontAwesomeIcon icon={faCopy} style={{ marginRight: '8px' }} />
                        <Input
                            value={recipeLink}
                            isReadOnly
                            className={styles.inputField}
                        />
                        <Button
                            className={hasCopied ? styles.copyButtonCopied : styles.copyButton}
                            onClick={onCopy}
                        >
                            {hasCopied ? 'Copied' : 'Copy'}
                        </Button>
                    </Flex>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};

export default ShareModal;

