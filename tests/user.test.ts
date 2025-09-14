import  {
    getAllUserInfoResolver, 
    getUserInfoResolver,
    getRoleDataResolver
} from '../src/resolvers/queries/userQueries';
jest.mock("../src/utils/logger");

describe("getAllUserInfoResolver", () => {
    let mockContext: any = {};

    beforeEach(() => {
        mockContext = {
            db: {
                user: {
                    findUnique: jest.fn()
                },
                language: {
                    findUnique: jest.fn()
                }
            },
            log: {
                error: jest.fn(),
                log: jest.fn()
            }
        };
    });

    test("Should return user information when it exists", async () => {
        mockContext.db.user.findUnique.mockResolvedValue({
            id: 1,
            uid: "12345",
            email: "test@example.com",
            first_name: "John",
            last_name: "Doe",
            photo_url: "https://example.com/photo.jpg",
            phone_number: "123456789",
            auth_type: "EMAIL",
            gender: "MALE",
            last_login: "2024-01-01T12:00:00Z",
            created_at: "2024-01-01T12:00:00Z",
            updated_at: "2024-01-02T12:00:00Z",
            country: { code: "US", area_code: "+1" },
            language_id: 1
        });

        mockContext.db.language.findUnique.mockResolvedValue({ code: "en" });

        const result = await getAllUserInfoResolver(null, { uid: "12345" }, mockContext);

        expect(result).toEqual({
            id: 1,
            uid: "12345",
            email: "test@example.com",
            firstName: "John",
            lastName: "Doe",
            photoUrl: "https://example.com/photo.jpg",
            phoneNumber: "123456789",
            authType: "EMAIL",
            gender: "MALE",
            lastLogin: "2024-01-01T12:00:00Z",
            createdAt: "2024-01-01T12:00:00Z",
            updatedAt: "2024-01-02T12:00:00Z",
            areaCode: "+1",
            countryCode: "US",
            language: "en"
        });

        expect(mockContext.db.user.findUnique).toHaveBeenCalledTimes(1);
        expect(mockContext.db.language.findUnique).toHaveBeenCalledTimes(1);
    });

    test("Should return default values if the user does not exist", async () => {
        mockContext.db.user.findUnique.mockResolvedValue(null);

        const result = await getAllUserInfoResolver(null, { uid: "nonexistent" }, mockContext);

        expect(result).toEqual({
            id: -1,
            uid: "",
            email: "",
            firstName: "",
            lastName: undefined,
            photoUrl: undefined,
            phoneNumber: undefined,
            authType: undefined,
            gender: undefined,
            lastLogin: undefined,
            createdAt: undefined,
            updatedAt: undefined,
            areaCode: undefined,
            countryCode: "",
            language: "en"
        });

        expect(mockContext.db.user.findUnique).toHaveBeenCalledTimes(1);
        expect(mockContext.db.language.findUnique).toHaveBeenCalledTimes(1);
    });

    test("Should handle database errors", async () => {
        mockContext.db.user.findUnique.mockRejectedValue(new Error("DB error"));

        const result = await getAllUserInfoResolver(null, { uid: "12345" }, mockContext);

        expect(result).toBeNull();
        expect(mockContext.db.user.findUnique).toHaveBeenCalledTimes(1);
    });
});


describe("getUserInfoResolver", () => {
    let mockContext: any = {};

    beforeEach(() => {
        mockContext = {
            db: {
                user: {
                    findUnique: jest.fn(),
                    create: jest.fn(),
                    update: jest.fn()
                },
                language: {
                    findUnique: jest.fn()
                }
            },
            log: {
                error: jest.fn(),
                log: jest.fn()
            }
        };
    });

    test("Should return user information when it exists", async () => {
        mockContext.db.user.findUnique.mockResolvedValue({
            id: 1,
            uid: "12345",
            email: "test@example.com",
            first_name: "John",
            last_name: "Doe",
            photo_url: "https://example.com/photo.jpg",
            phone_number: "123456789",
            auth_type: "EMAIL",
            gender: "MALE",
            last_login: "2024-01-01T12:00:00Z",
            created_at: "2024-01-01T12:00:00Z",
            updated_at: "2024-01-02T12:00:00Z",
            country: { code: "US" },
            language_id: 1
        });

        mockContext.db.language.findUnique.mockResolvedValue({ code: "en" });

        const result = await getUserInfoResolver(null, { uid: "12345" }, mockContext);

        expect(result).toEqual({
            id: 1,
            uid: "12345",
            email: "test@example.com",
            firstName: "John",
            lastName: "Doe",
            photoUrl: "https://example.com/photo.jpg",
            phoneNumber: "123456789",
            authType: "EMAIL",
            gender: "MALE",
            lastLogin: "2024-01-01T12:00:00Z",
            createdAt: "2024-01-01T12:00:00Z",
            updatedAt: "2024-01-02T12:00:00Z",
            countryCode: "US",
            language: "en"
        });

        expect(mockContext.db.user.findUnique).toHaveBeenCalledTimes(1);
        expect(mockContext.db.language.findUnique).toHaveBeenCalledTimes(2);
    });

    test("Should create a new user if it does not exist", async () => {
        mockContext.db.user.findUnique.mockResolvedValueOnce(null);
        mockContext.db.language.findUnique.mockResolvedValue({ id: 1, code: "en" });
        mockContext.db.user.create.mockResolvedValue({
            id: 1,
            uid: "12345",
            email: "test@example.com",
            first_name: "John",
            last_name: "Doe",
            photo_url: "https://example.com/photo.jpg",
            phone_number: "123456789",
            auth_type: "EMAIL",
            gender: "MALE",
            last_login: "2024-01-01T12:00:00Z",
            created_at: "2024-01-01T12:00:00Z",
            updated_at: "2024-01-02T12:00:00Z",
            country: { code: "US" },
            language_id: 1
        });
        mockContext.db.user.findUnique.mockResolvedValue({
            id: 1,
            uid: "12345",
            email: "test@example.com",
            first_name: "John",
            last_name: "Doe",
            photo_url: "https://example.com/photo.jpg",
            phone_number: "123456789",
            auth_type: "EMAIL",
            gender: "MALE",
            last_login: "2024-01-01T12:00:00Z",
            created_at: "2024-01-01T12:00:00Z",
            updated_at: "2024-01-02T12:00:00Z",
            country: { code: "US" },
            language_id: 1
        });

        const result = await getUserInfoResolver(null, {
            uid: "12345",
            displayName: "John Doe",
            email: "test@example.com",
            phoneNumber: "123456789",
            photoUrl: "https://example.com/photo.jpg",
            authType: "EMAIL",
            language: "en"
        }, mockContext);

        expect(result).toEqual({
            id: 1,
            uid: "12345",
            email: "test@example.com",
            firstName: "John",
            lastName: "Doe",
            photoUrl: "https://example.com/photo.jpg",
            phoneNumber: "123456789",
            authType: "EMAIL",
            gender: "MALE",
            lastLogin: expect.any(String),
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            countryCode: "US",
            language: "en"
        });

        expect(mockContext.db.user.findUnique).toHaveBeenCalledTimes(2);
        expect(mockContext.db.user.create).toHaveBeenCalledTimes(1);
    });

    test("Should handle database errors", async () => {
        mockContext.db.user.findUnique.mockRejectedValue(new Error("DB error"));

        const result = await getUserInfoResolver(null, { uid: "12345" }, mockContext);

        expect(result).toBeNull();
        expect(mockContext.db.user.findUnique).toHaveBeenCalledTimes(1);
        expect(mockContext.log.error).toHaveBeenCalledWith("Error in getUserInfoResolver:", expect.any(Error));
    });
});


describe("getRoleDataResolver", () => {
    let mockContext: any = {};

    beforeEach(() => {
        mockContext = {
            db: {
                user: {
                    findUnique: jest.fn()
                }
            },
            log: {
                error: jest.fn(),
                log: jest.fn()
            }
        };
    });

    test("Should return role data when user exists", async () => {
        mockContext.db.user.findUnique.mockResolvedValue({
            id: 1,
            role: {
                id: 1,
                menu_status: [
                    {
                        code: "PROF",
                        type: "USER",
                        visible: true
                    }
                ],
                name: "Superuser",
                permissions: [
                    {
                        permission: {
                            key: "C"
                        },
                        section: {
                            code: "DSHB"
                        }
                    }
                ]
            }
        });

        const result = await getRoleDataResolver(null, { uid: "12345" }, mockContext);

        expect(result).toEqual({
            id: 1,
            role: {
                id: 1,
                menu_status: [
                    {
                        code: "PROF",
                        type: "USER",
                        visible: true
                    }
                ],
                name: "Superuser",
                permissions: [
                    {
                        permission: {
                            key: "C"
                        },
                        section: {
                            code: "DSHB"
                        }
                    }
                ]
            }
        });

        expect(mockContext.db.user.findUnique).toHaveBeenCalledTimes(1);
    });

    test("Should return null if user does not exist", async () => {
        mockContext.db.user.findUnique.mockResolvedValue(null);

        const result = await getRoleDataResolver(null, { uid: "nonexistent" }, mockContext);

        expect(result).toBeNull();

        expect(mockContext.db.user.findUnique).toHaveBeenCalledTimes(1);
    });

    test("Should handle database errors", async () => {
        mockContext.db.user.findUnique.mockRejectedValue(new Error("DB error"));

        const result = await getRoleDataResolver(null, { uid: "12345" }, mockContext);

        expect(result).toBeNull();
        expect(mockContext.db.user.findUnique).toHaveBeenCalledTimes(1);
        expect(mockContext.log.error).toHaveBeenCalledWith("Error in getRolData:", expect.any(Error));
    });
});