import prisma from "../config/prisma.js";

const groupInclude = {
    creator: {
        select: {
            id: true,
            name: true
        }
    },
    memberships: {
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            }
        }
    }
};

async function isGroupMember(groupId, userId) {
    return prisma.groupMember.findUnique({
        where: {
            groupId_userId: {
                groupId,
                userId
            }
        }
    });
}

export async function createGroup(req, res) {
    try {
        const creatorId = req.user.id;
        const { name, memberIds = [] } = req.body;
        const cleanName = name?.trim();

        if (!cleanName) {
            return res.status(400).json({
                message: "Group name is required"
            });
        }

        if (!Array.isArray(memberIds)) {
            return res.status(400).json({
                message: "Group members must be a list"
            });
        }

        const selectedMemberIds = [
            ...new Set(
                memberIds
                    .map(Number)
                    .filter(Number.isInteger)
            )
        ].filter((userId) => userId !== creatorId);

        if (selectedMemberIds.length === 0) {
            return res.status(400).json({
                message: "Select at least one group member"
            });
        }

        const existingMembers = await prisma.user.count({
            where: {
                id: {
                    in: selectedMemberIds
                }
            }
        });

        if (existingMembers !== selectedMemberIds.length) {
            return res.status(400).json({
                message: "One or more selected users do not exist"
            });
        }

        const group = await prisma.group.create({
            data: {
                name: cleanName,
                creatorId,
                memberships: {
                    create: [creatorId, ...selectedMemberIds].map(
                        (userId) => ({ userId })
                    )
                }
            },
            include: groupInclude
        });

        const io = req.app.get("io");

        selectedMemberIds.forEach((userId) => {
            io.to(`user_${userId}`).emit(
                "group_created",
                group
            );
        });

        return res.status(201).json(group);
    } catch (error) {
        console.error("Create group error:", error);

        return res.status(500).json({
            message: "Unable to create group"
        });
    }
}

export async function getGroups(req, res) {
    try {
        const groups = await prisma.group.findMany({
            where: {
                memberships: {
                    some: {
                        userId: req.user.id
                    }
                }
            },
            include: groupInclude,
            orderBy: {
                updatedAt: "desc"
            }
        });

        return res.status(200).json(groups);
    } catch (error) {
        console.error("Get groups error:", error);

        return res.status(500).json({
            message: "Unable to fetch groups"
        });
    }
}

export async function getGroupMessages(req, res) {
    try {
        const groupId = Number(req.params.groupId);

        if (!Number.isInteger(groupId)) {
            return res.status(400).json({
                message: "Invalid group"
            });
        }

        if (!(await isGroupMember(groupId, req.user.id))) {
            return res.status(403).json({
                message: "You are not a member of this group"
            });
        }

        const messages = await prisma.groupMessage.findMany({
            where: {
                groupId
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            },
            orderBy: {
                createdAt: "asc"
            }
        });

        return res.status(200).json(messages);
    } catch (error) {
        console.error("Get group messages error:", error);

        return res.status(500).json({
            message: "Unable to fetch group messages"
        });
    }
}

export async function sendGroupMessage(req, res) {
    try {
        const groupId = Number(req.params.groupId);
        const senderId = req.user.id;
        const text = req.body.text?.trim();

        if (!Number.isInteger(groupId) || !text) {
            return res.status(400).json({
                message: "Group and message are required"
            });
        }

        if (!(await isGroupMember(groupId, senderId))) {
            return res.status(403).json({
                message: "You are not a member of this group"
            });
        }

        const message = await prisma.groupMessage.create({
            data: {
                groupId,
                senderId,
                text
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });

        return res.status(201).json(message);
    } catch (error) {
        console.error("Send group message error:", error);

        return res.status(500).json({
            message: "Unable to send group message"
        });
    }
}
