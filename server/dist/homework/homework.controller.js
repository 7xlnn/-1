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
exports.HomeworkController = void 0;
const common_1 = require("@nestjs/common");
const homework_service_1 = require("./homework.service");
let HomeworkController = class HomeworkController {
    constructor(homework) {
        this.homework = homework;
    }
    submit(dto) {
        return this.homework.create(dto);
    }
    mine(studentId) {
        return this.homework.listMine(studentId || '');
    }
    teacherList(status) {
        return this.homework.listTeacher(status);
    }
    teacherStats() {
        return this.homework.stats();
    }
    detail(id) {
        return this.homework.detail(id);
    }
    remove(id) {
        return this.homework.remove(id);
    }
    review(id) {
        return this.homework.markReviewed(id);
    }
    draftUpsert(studentId, key, data) {
        return this.homework.draftUpsert(studentId, key, data);
    }
    draftList(studentId) {
        return this.homework.draftList(studentId || '');
    }
    draftDelete(studentId, key) {
        return this.homework.draftDelete(studentId || '', key || '');
    }
    grade(id, dto) {
        return this.homework.grade(id, dto);
    }
};
exports.HomeworkController = HomeworkController;
__decorate([
    (0, common_1.Post)('submit'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], HomeworkController.prototype, "submit", null);
__decorate([
    (0, common_1.Get)('mine'),
    __param(0, (0, common_1.Query)('studentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], HomeworkController.prototype, "mine", null);
__decorate([
    (0, common_1.Get)('teacher/list'),
    __param(0, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], HomeworkController.prototype, "teacherList", null);
__decorate([
    (0, common_1.Get)('teacher/stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HomeworkController.prototype, "teacherStats", null);
__decorate([
    (0, common_1.Get)('detail/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], HomeworkController.prototype, "detail", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], HomeworkController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)('review/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], HomeworkController.prototype, "review", null);
__decorate([
    (0, common_1.Post)('draft'),
    __param(0, (0, common_1.Body)('studentId')),
    __param(1, (0, common_1.Body)('key')),
    __param(2, (0, common_1.Body)('data')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], HomeworkController.prototype, "draftUpsert", null);
__decorate([
    (0, common_1.Get)('draft'),
    __param(0, (0, common_1.Query)('studentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], HomeworkController.prototype, "draftList", null);
__decorate([
    (0, common_1.Delete)('draft/:studentId/:key'),
    __param(0, (0, common_1.Param)('studentId')),
    __param(1, (0, common_1.Param)('key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], HomeworkController.prototype, "draftDelete", null);
__decorate([
    (0, common_1.Post)('grade/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], HomeworkController.prototype, "grade", null);
exports.HomeworkController = HomeworkController = __decorate([
    (0, common_1.Controller)('homework'),
    __metadata("design:paramtypes", [homework_service_1.HomeworkService])
], HomeworkController);
//# sourceMappingURL=homework.controller.js.map