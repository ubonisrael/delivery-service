import GroupChatController from "../controllers/groupChatController";

export default function setGroupChatRoutes(app) {
    const controller = new GroupChatController();

    app.post('/group-chat/send', (req, res) => controller.sendMessage(req, res));
    app.get('/group-chat/messages', (req, res) => controller.getMessages(req, res));
};