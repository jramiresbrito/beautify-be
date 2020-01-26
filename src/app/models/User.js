import Sequelize, { Model } from 'sequelize';
import * as yup from 'yup';
import bcrypt from 'bcryptjs';

class User extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
        email: Sequelize.STRING,
        password: Sequelize.VIRTUAL,
        password_hash: Sequelize.STRING,
        provider: Sequelize.BOOLEAN,
      },
      {
        sequelize,
      }
    );

    this.addHook('beforeSave', async user => {
      if (user.password) {
        user.password_hash = await bcrypt.hash(user.password, 8);
      }
    });

    return this;
  }

  static validateUserCreation(user) {
    const schema = yup.object().shape({
      name: yup
        .string()
        .min(5)
        .max(255)
        .required(),
      email: yup
        .string()
        .email()
        .min(5)
        .max(255)
        .required(),
      password: yup
        .string()
        .min(6)
        .max(50)
        .required(),
    });

    return schema.isValid(user);
  }

  static validateUserUpdate(user) {
    const schema = yup.object().shape({
      name: yup
        .string()
        .min(5)
        .max(255),
      email: yup
        .string()
        .email()
        .min(5)
        .max(255),
      oldPassword: yup
        .string()
        .min(6)
        .max(50),
      password: yup
        .string()
        .min(6)
        .max(50)
        .when('oldPassword', (oldPassword, field) =>
          oldPassword ? field.required() : field
        ),
      confirmPassword: yup
        .string()
        .when('password', (password, field) =>
          password ? field.required().oneOf([yup.ref('password')]) : field
        ),
      avatar_id: yup.number(),
    });

    return schema.isValid(user);
  }

  static validateUserSession(user) {
    const schema = yup.object().shape({
      email: yup
        .string()
        .min(5)
        .max(255)
        .email()
        .required(),
      password: yup
        .string()
        .min(6)
        .max(50)
        .required(),
    });

    return schema.isValid(user);
  }

  static associate(models) {
    this.belongsTo(models.File, { foreignKey: 'avatar_id', as: 'avatar' });
  }

  checkPassword(password) {
    return bcrypt.compare(password, this.password_hash);
  }
}

export default User;
