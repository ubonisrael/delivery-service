import PrivateChatController from "../controllers/privateChatController";

export default function setPrivateChatRoutes (app) {
    const privateChatController = new PrivateChatController();

    app.post('/private-chat/send', privateChatController.sendPrivateMessage);
    app.get('/private-chat/messages/:manufacturerId/:wholesalerId', privateChatController.getPrivateMessages);
};
