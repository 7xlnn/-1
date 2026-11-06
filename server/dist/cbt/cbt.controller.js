"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CbtController = void 0;
const common_1 = require("@nestjs/common");
const cbt_service_1 = require("./cbt.service");
let CbtController = class CbtController {
    constructor(cbtService) {
        this.cbtService = cbtService;
    }
    chat(body, headers) {
        console.log('[CBT CHAT] profile:', body.profile?.name, 'messages:', body.messages?.length);
        return this.cbtService.chat(body, headers);
    }
    summary(body, headers) {
        console.log('[CBT SUMMARY] profile:', body.profile?.name, 'msg:', body.messages?.length);
        return this.cbtService.summary(body, headers);
    }
    feedback(body, headers) {
        console.log('[CBT FEEDBACK] profile:', body.profile?.name, 'task:', body.taskType);
        return this.cbtService.feedback(body, headers);
    }
    moodRecord(body, headers) {
        console.log('[CBT MOOD-RECORD] profile:', body.profile?.name, 'session:', body.sessionIndex, '/', body.totalSessions);
        return this.cbtService.generateMoodRecord(body, headers);
    }
    askSupervisor(body, headers) {
        console.log('[CBT ASK-SUPERVISOR] title:', body.title, 'question:', body.question?.slice(0, 30));
        return this.cbtService.askSupervisor(body, headers);
    }
};
exports.CbtController = CbtController;
__decorate([
    (0, common_1.Post)('chat'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], CbtController.prototype, "chat", null);
__decorate([
    (0, common_1.Post)('summary'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], CbtController.prototype, "summary", null);
__decorate([
    (0, common_1.Post)('feedback'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], CbtController.prototype, "feedback", null);
__decorate([
    (0, common_1.Post)('mood-record'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], CbtController.prototype, "moodRecord", null);
__decorate([
    (0, common_1.Post)('ask-supervisor'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], CbtController.prototype, "askSupervisor", null);
exports.CbtController = CbtController = __decorate([
    (0, common_1.Controller)('cbt'),
    __metadata("design:paramtypes", [cbt_service_1.CbtService])
], CbtController);
//# sourceMappingURL=cbt.controller.js.map