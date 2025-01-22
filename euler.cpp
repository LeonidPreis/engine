#include "../include/euler.h"
#include "../include/vector4.h"
#include "../include/matrix4.h"
#include "../include/quaternion.h"

Euler::Order Euler::StringToOrder(const std::string& order) {
    if (order == "XYZ" || order == "xyz") return Order::XYZ;
    if (order == "XZY" || order == "xzy") return Order::XZY;
    if (order == "YXZ" || order == "yxz") return Order::YXZ;
    if (order == "YZX" || order == "yzx") return Order::YZX;
    if (order == "ZXY" || order == "zxy") return Order::ZXY;
    if (order == "ZYX" || order == "zyx") return Order::ZYX;
    throw std::invalid_argument("Invalid rotation order: " + order + ".\nValid options are: XYZ, XZY, YXZ, YZX, ZXY, ZYX or xyz, xzy, yxz, yzx, zxy, zyx.");
}

std::string Euler::OrderToString(Euler::Order order) {
    switch (order) {
        case Order::XYZ: return "XYZ";
        case Order::XZY: return "XZY";
        case Order::YXZ: return "YXZ";
        case Order::YZX: return "YZX";
        case Order::ZXY: return "ZXY";
        case Order::ZYX: return "ZYX";
        default: return "Unknown";
    }
}

void Euler::Print(const int& precision = 6) const {
    std::cout << std::fixed << std::setprecision(precision) << "Euler( x: " << alpha << " y: " << beta << " z: " << gamma << " order: " << Euler::OrderToString(this->order) << " )\n" << std::endl;
}

Euler Euler::XYZ(const Matrix4& rotation, bool intrinsic, float epsilon) {
    float alpha, beta, gamma; 
    float cosBeta = sqrt(rotationMatrix.m11*rotationMatrix.m11 + rotationMatrix.m12*rotationMatrix.m12);

    if (intrinsic) {
        if (cosBeta > epsilon) {
            beta = atan2f(rotationMatrix.m13, cosBeta);
            alpha = atan2f(-rotationMatrix.m23, rotationMatrix.m33);
            gamma = atan2f(-rotationMatrix.m12, rotationMatrix.m11);
        } else {
            alpha = 0;
            if (rotationMatrix.m13 < 0.0) {
                beta = -M_PI_2;
                gamma = -atan2f(rotationMatrix.m21, rotationMatrix.m22);
            } else {
                beta = M_PI_2;
                gamma = atan2f(rotationMatrix.m21, -rotationMatrix.m22);
            }
        }
    } else {
        if (cosBeta > epsilon) {
            beta = atan2f(rotationMatrix.m13, cosBeta);
            alpha = atan2f(-rotationMatrix.m12, rotationMatrix.m11);
            gamma = atan2f(-rotationMatrix.m23, rotationMatrix.m33);
        } else {
            alpha = 0;
            if (rotationMatrix.m13 < 0.0) {
                beta = -M_PI_2;
                gamma = -atan2f(rotationMatrix.m21, rotationMatrix.m22);
            } else {
                beta = M_PI_2;
                gamma = atan2f(rotationMatrix.m21, rotationMatrix.m22);
            }
        }
    }

    return Euler(alpha, beta, gamma, "XYZ");
}

Euler Euler::XZY(const Matrix4& rotation, bool intrinsic, float epsilon) {
    float alpha, beta, gamma;
    float cosBeta = sqrt(rotationMatrix.m11*rotationMatrix.m11 + rotationMatrix.m13*rotationMatrix.m13);

    if (cosBeta > epsilon) {
        beta = atan2f(-rotationMatrix.m12, cosBeta);
        alpha = atan2f(rotationMatrix.m32, rotationMatrix.m22);
        gamma = atan2f(rotationMatrix.m13, rotationMatrix.m11);
    } else {
        alpha = 0;
        if (rotationMatrix.m12 < 0.0) {
            beta = M_PI_2;
            gamma = atan2f(rotationMatrix.m23, rotationMatrix.m33);
        } else {
            beta = -M_PI_2;
            gamma = atan2f(rotationMatrix.m23, rotationMatrix.m33);
        }
    }

    return Euler(alpha, beta, gamma, "XZY");
}

Euler Euler::YXZ(const Matrix4& rotation, bool intrinsic, float epsilon) {
    float alpha, beta, gamma;
    float cosBeta = sqrt(rotationMatrix.m21*rotationMatrix.m21 + rotationMatrix.m22*rotationMatrix.m22);

    if (cosBeta > epsilon) {
        beta = atan2f(-rotationMatrix.m23, cosBeta);
        alpha = atan2f(rotationMatrix.m13, rotationMatrix.m33);
        gamma = atan2f(rotationMatrix.m21, rotationMatrix.m22);
    } else {
        alpha = 0;
        if (rotationMatrix.m23 < 0.0) {
            beta = M_PI_2;
            gamma = atan2f(rotationMatrix.m31, rotationMatrix.m32);
        } else {
            beta = -M_PI_2;
            gamma = atan2f(rotationMatrix.m31, rotationMatrix.m32);
        }
    }

    return Euler(alpha, beta, gamma, "YXZ");
}

Euler Euler::YZX(const Matrix4& rotation, bool intrinsic, float epsilon) {
    float alpha, beta, gamma;
    float cosBeta = sqrt(rotationMatrix.m11*rotationMatrix.m11 + rotationMatrix.m31*rotationMatrix.m31);

    if (cosBeta > epsilon) {
        beta = atan2f(rotationMatrix.m21, cosBeta);
        alpha = atan2f(-rotationMatrix.m31, rotationMatrix.m11);
        gamma = atan2f(-rotationMatrix.m23, rotationMatrix.m22);
    } else {
        alpha = 0;
        if (rotationMatrix.m21 < 0.0) {
            beta = -M_PI_2;
            gamma = -atan2f(rotationMatrix.m32, rotationMatrix.m33);
        } else {
            beta = M_PI_2;
            gamma = atan2f(rotationMatrix.m32, rotationMatrix.m33);
        }
    }

    return Euler(alpha, beta, gamma, "YZX");
}

Euler Euler::ZXY(const Matrix4& rotation, bool intrinsic, float epsilon) {
    float alpha, beta, gamma;
    float cosBeta = sqrt(rotationMatrix.m31*rotationMatrix.m31 + rotationMatrix.m33*rotationMatrix.m33);

    if (cosBeta > epsilon) {
        beta = atan2f(rotationMatrix.m32, cosBeta);
        alpha = atan2f(-rotationMatrix.m12, rotationMatrix.m22);
        gamma = atan2f(-rotationMatrix.m31, rotationMatrix.m33);
    } else {
        alpha = 0;
        if (rotationMatrix.m32 < 0.0) {
            beta = -M_PI_2;
            gamma = atan2f(rotationMatrix.m21, rotationMatrix.m22);
        } else {
            beta = M_PI_2;
            gamma = atan2f(rotationMatrix.m21, rotationMatrix.m22);
        }
    }

    return Euler(alpha, beta, gamma, "ZXY");
}

Euler Euler::ZYX(const Matrix4& rotation, bool intrinsic, float epsilon) {
    float alpha, beta, gamma;
    float cosBeta = sqrt(rotationMatrix.m32*rotationMatrix.m32 + rotationMatrix.m33*rotationMatrix.m33);

    if (cosBeta > epsilon) { 
        beta = atan2f(-rotationMatrix.m31, cosBeta);
        alpha = atan2f(rotationMatrix.m21, rotationMatrix.m11);
        gamma = atan2f(rotationMatrix.m32, rotationMatrix.m33);
    } else {
        alpha = 0;
        if (rotationMatrix.m31 < 0.0) {
            beta = M_PI_2;
            gamma = atan2f(rotationMatrix.m12, rotationMatrix.m22);
        } else {
            beta = -M_PI_2;
            gamma = atan2f(rotationMatrix.m12, rotationMatrix.m22);
        }
    }

    return Euler(alpha, beta, gamma, "ZYX");
}

Euler Euler::FromAngleAxis(const float& angleRadians, const Vector4& axis, const std::string& order) {
    Euler::Order ORDER = StringToOrder(order);

    const float cosTheta = cosf(angleRadians);
    const float sinTheta = sinf(angleRadians);

    const Matrix4 rotationMatrix = Matrix4(
        cosTheta + axis.x * axis.x * (1.0f - cosTheta), axis.x * axis.y * (1.0f - cosTheta) - axis.z * sinTheta, axis.x * axis.z * (1.0f - cosTheta) + axis.y * sinTheta, 0,
        axis.y * axis.x * (1.0f - cosTheta) + axis.z * sinTheta, cosTheta + axis.y * axis.y * (1.0f - cosTheta), axis.y * axis.z * (1.0f - cosTheta) - axis.x * sinTheta, 0,
        axis.z * axis.x * (1.0f - cosTheta) - axis.y * sinTheta, axis.z * axis.y * (1.0f - cosTheta) + axis.x * sinTheta, cosTheta + axis.z * axis.z * (1.0f - cosTheta), 0,
        0,                                                       0,                                              0,                                                       1                
    );

    float alpha, beta, gamma;

    switch(ORDER) {
        case Order::XYZ:
            return Euler::XYZ(rotationMatrix);
            break;
        case Order::XZY:
            return Euler::XZY(rotationMatrix);
            break;
        case Order::YXZ:
            return Euler::YXZ(rotationMatrix);
            break;
        case Order::YZX:
            return Euler::YZX(rotationMatrix);
            break;
        case Order::ZXY:
            return Euler::ZXY(rotationMatrix);
            break;
        case Order::ZYX:
            return Euler::ZYX(rotationMatrix);
            break;
        default:
            throw std::invalid_argument("Invalid rotation order: " + order + ".\nValid options are: XYZ, XZY, YXZ, YZX, ZXY, ZYX or xyz, xzy, yxz, yzx, zxy, zyx.");
    }
    return Euler(alpha, beta, gamma, order);
}

Euler Euler::FromQuaternion(const Quaternion& q) {
    return Euler(
       -atan2f(2 * (q.w * q.x + q.y * q.z), 1 - 2 * (q.x * q.x + q.y * q.y)),
        asinf(2 * (q.w * q.y - q.z * q.x)),
        atan2f(2 * (q.w * q.z + q.x * q.y), 1 - 2 * (q.y * q.y + q.z * q.z))
    );
}

float Euler::ToRotationAngle() const {
    const Matrix4 m = this->RotateXYZ();
    return acosf(0.5f * (m.m11 + m.m22 + m.m33 - 1.0f));
}

Vector4 Euler::ToRotationAxis() const {
    const Matrix4 m = this->RotateXYZ();
    const float multiplier = 1.0f / (2.0f * sinf(this->ToRotationAngle()));
    return Vector4(
        (m.m32 - m.m23) * multiplier,
        (m.m13 - m.m31) * multiplier,
        (m.m21 - m.m12) * multiplier,
        0.0f
    );
}

Quaternion Euler::ToQuaternion() const {
    const Matrix4 m = this->RotateXYZ();
    const float w = sqrtf((1 + m.m11 + m.m22 + m.m33) * 0.25f);
    const float x = sqrtf((1 + m.m11 - m.m22 - m.m33) * 0.25f);
    const float y = sqrtf((1 - m.m11 + m.m22 - m.m33) * 0.25f);
    const float z = sqrtf((1 - m.m11 - m.m22 + m.m33) * 0.25f);

    if (w > x && w > y && w > z) {
        const float multiplier = 1.0f / (4.0f * w);
        return Quaternion(
            w,
            (m.m32 - m.m23) * multiplier,
            (m.m13 - m.m31) * multiplier,
            (m.m21 - m.m12) * multiplier
        );
    }

    if (x > w && x > y && x > z) {
        const float multiplier = 1.0f / (4.0f * x);
        return Quaternion(
            (m.m32 - m.m23) * multiplier,
            x,
            (m.m12 + m.m21) * multiplier,
            (m.m13 + m.m31) * multiplier
        );
    }

    if (y > w && y > x && y > z) {
        const float multiplier = 1.0f / (4.0f * y);
        return Quaternion(
            (m.m13 - m.m31) * multiplier,
            (m.m12 + m.m21) * multiplier,
            y,
            (m.m23 + m.m32) * multiplier
        );
    }

    if (z > w && z > x && z > y) {
        const float multiplier = 1.0f / (4.0f * z);
        return Quaternion(
            (m.m21 - m.m12) * multiplier,
            (m.m13 + m.m31) * multiplier,
            (m.m23 + m.m32) * multiplier,
            z
        );
    }

    std::cerr << "Cannot determine quaternion from matrix." << std::endl;
    return Quaternion();
}

Matrix4 Euler::RotateX() const {
    const float c = cosf(this->alpha);
    const float s = sinf(this->alpha);
    return Matrix4(
        1, 0, 0, 0,
        0, c,-s, 0,
        0, s, c, 0,
        0, 0, 0, 1
    );
}

Matrix4 Euler::RotateY() const {
    const float c = cosf(this->beta);
    const float s = sinf(this->beta);
    return Matrix4(
        c, 0, s, 0,
        0, 1, 0, 0,
       -s, 0, c, 0,
        0, 0, 0, 1
    );
}

Matrix4 Euler::RotateZ() const {
    const float c = cosf(this->gamma);
    const float s = sinf(this->gamma);
    return Matrix4(
        c,-s, 0, 0,
        s, c, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    );
}

Matrix4 Euler::RotateXYZ() const {
    const float cA = cosf(this->alpha),  sA = sinf(this->alpha);
    const float cB = cosf(this->beta), sB = sinf(this->beta);
    const float cG = cosf(this->gamma),   sG = sinf(this->gamma);

    if (this->intrinsic) {
        switch (this->order) {
            case Order::XYZ:
                return Matrix4(
                    cB*cG , -cB*sG , sB, 0,
                    cA*sG + sA*sB*cG , cA*cG - sA*sB*sG , -sA*cB, 0,
                    sA*sG - cA*sB*cG , cA*sB*sG + sA*cG , cA*cB, 0,
                    0,0,0,1);
                break;
            case Order::XZY:
                return Matrix4(
                    cG*cB , -sB , sG*cB, 0,
                    cA*cG*sB + sA*sG , cA*cB , cA*sG*sB - sA*cG, 0,
                    sA*cG*sB - cA*sG , sA*cB , cA*cG + sA*sG*sB, 0,
                    0,0,0,1);
                break;
            case Order::YXZ:
                return Matrix4(
                    sB*sA*sG + cA*cG , sB*sA*cG - cA*sG , cB*sA, 0,
                    cB*sG , cB*cG , -sB, 0,
                    sB*cA*sG - sA*cG , sB*cA*cG + sA*sG , cB*cA, 0,
                    0,0,0,1);
                break;
            case Order::YZX:
                return Matrix4(
                    cA*cB , sG*sA - cG*cA*sB , cG*sA + sG*cA*sB, 0,
                    sB , cG*cB , -sG*cB, 0,
                    -sA*cB , cG*sA*sB + sG*cA , cG*cA - sG*sA*sB, 0,
                    0,0,0,1);
                break;
            case Order::ZXY:
                return Matrix4(
                    cG*cA - sB*sG*sA , -cB*sA , sB*cG*sA + sG*cA, 0,
                    sB*sG*cA + cG*sA , cB*cA , sG*sA - sB*cG*cA, 0,
                    -cB*sG , sB , cB*cG, 0,
                    0,0,0,1);
                break;
            case Order::ZYX:
                return Matrix4(
                    cB*cA , sG*sB*cA - cG*sA , cG*sB*cA + sG*sA, 0,
                    cB*sA , cG*cA + sG*sB*sA , cG*sB*sA - sG*cA, 0,
                    -sB , sG*cB , cG*cB, 0,
                    0,0,0,1);
                break;
            default:
                std::cerr << "Invalid rotation order.\nValid options are: XYZ, XZY, YXZ, YZX, ZXY, ZYX or xyz, xzy, yxz, yzx, zxy, zyx." << std::endl;
                return Matrix4();
        }
    } else {
        switch (this->order) {
            case Order::XYZ:
                return Matrix4(
                    cB*cA , -cB*sA , sB, 0,
                    cG*sA + sG*sB*cA , cG*cA - sG*sB*sA , -sG*cB, 0,
                    sG*sA - cG*sB*cA , cG*sB*sA + sG*cA , cG*cB, 0,
                    0,0,0,1);
                break;
            case Order::XZY:
                return Matrix4(
                    cA*cB , -sB , sA*cB, 0,
                    cG*cA*sB + sG*sA , cG*cB , cG*sA*sB - sG*cA, 0,
                    sG*cA*sB - cG*sA , sG*cB , cG*cA + sG*sA*sB, 0,
                    0,0,0,1);
                break;
            case Order::YXZ:
                return Matrix4(
                    sB*sG*sA + cG*cA , sB*sG*cA - cG*sA , cB*sG, 0,
                    cB*sA , cB*cA , -sB, 0,
                    sB*cG*sA - sG*cA , sB*cG*cA + sG*sA , cB*cG, 0,
                    0,0,0,1);
                break;
            case Order::YZX:
                return Matrix4(
                    cG*cB , sA*sG - cA*cG*sB , cA*sG + sA*cG*sB, 0,
                    sB , cA*cB , -sA*cB, 0,
                    -sG*cB , cA*sG*sB + sA*cG , cA*cG - sA*sG*sB, 0,
                    0,0,0,1);
                break;
            case Order::ZXY:
                return Matrix4(
                    cA*cG - sB*sA*sG , -cB*sG , sB*cA*sG + sA*cG, 0,
                    sB*sA*cG + cA*sG , cB*cG , sA*sG - sB*cA*cG, 0,
                    -cB*sA , sB , cB*cA, 0,
                    0,0,0,1);
                break;
            case Order::ZYX:
                return Matrix4(
                    cB*cG , sA*sB*cG - cA*sG , cA*sB*cG + sA*sG, 0,
                    cB*sG , cA*cG + sA*sB*sG , cA*sB*sG - sA*cG, 0,
                    -sB , sA*cB , cA*cB, 0,
                    0,0,0,1);
                break;
            default:
                std::cerr << "Invalid rotation order.\nValid options are: XYZ, XZY, YXZ, YZX, ZXY, ZYX or xyz, xzy, yxz, yzx, zxy, zyx." << std::endl;
                return Matrix4();
        }
    }
}


#ifdef _WIN32
#include <windows.h>
#include <cstdlib>
void clearConsole() {
    system("cls");
    std::cout << "\n" << std::endl;
}
#endif

int main() {
    float rad = M_PI / 180.0;
    float deg = 180.0 / M_PI;
    std::string input;

    while (true) {
        std::cout << "Type 'exit' to quit, 'clear' to clear console.\n";
        
        if (input == "exit") {
            break;
        } else if (input == "clear") {
            clearConsole();
            continue;
        }

        try {
            std::cout << "\n______________________________________________________________________________________\n" <<std::endl;
            std::cout << "\nEnter alpha (degrees): ";
            std::cin >> input;
            float alphaDeg = std::stof(input);
            std::cout << "Enter beta (degrees):  ";
            std::cin >> input;
            float betaDeg = std::stof(input);
            std::cout << "Enter gamma (degrees): ";
            std::cin >> input;
            float gammaDeg = std::stof(input);
            std::cout << "Enter order (xyz, xzy) ";
            std::cin >> input;
            Euler::Order ord = Euler::StringToOrder(input);
            std::cout << "Enter rotation type (intrinsic/extrinsic) as true or false:"
            std::cin >> input;
            bool type = input == "true" ? true : false;

            float alpha = alphaDeg * rad;
            float beta = betaDeg * rad;
            float gamma = gammaDeg * rad;

            Euler euler = Euler(alpha, beta, gamma, ord, type);
            Matrix4 rotationMatrix = euler.RotateXYZ();
            std::cout << "Euler angles:\n" << std::endl;
            euler.Print(3);

            std::cout << "Rotation matrix:\n" << std::endl;
            rotationMatrix.Print(3);

            Euler::Order order = Euler::StringToOrder(input);

            std::cout << "Current Euler order is " << Euler::OrderToString(order) << std::endl;

            Euler resultEuler;
            switch (order) {
                case Euler::Order::XYZ:
                    resultEuler = Euler::XYZ(rotationMatrix);
                    break;
                case Euler::Order::XZY:
                    resultEuler = Euler::XZY(rotationMatrix);
                    break;
                case Euler::Order::YXZ:
                    resultEuler = Euler::YXZ(rotationMatrix);
                    break;
                case Euler::Order::YZX:
                    resultEuler = Euler::YZX(rotationMatrix);
                    break;
                case Euler::Order::ZXY:
                    resultEuler = Euler::ZXY(rotationMatrix);
                    break;
                case Euler::Order::ZYX:
                    resultEuler = Euler::ZYX(rotationMatrix);
                    break;
                default:
                    throw std::invalid_argument("Unknown rotation order.");
            }

            std::cout << Euler::OrderToString(resultEuler.order) << " computed angles:\n";
            std::cout << "\n\talpha: " << resultEuler.alpha * deg << "\n\tbeta: " << resultEuler.beta * deg << "\n\tgamma: " << resultEuler.gamma * deg << "\n\torder: " << Euler::OrderToString(resultEuler.order) << "\n\n";

            resultEuler.Print(3);

            std::cout << "______________________________________________________________________________________\n" <<std::endl;

        } catch (const std::invalid_argument&) {
            std::cout << "\nInvalid input. Please enter a valid number, 'exit', or 'clear'.\n";
        }
    }
    return 0;
}


