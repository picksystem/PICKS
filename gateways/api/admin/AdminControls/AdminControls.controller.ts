import { Request, Response } from 'express';

export class AdminControlsController {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(private prisma: any) {}

  get = async (_req: Request, res: Response): Promise<void> => {
    let controls = await this.prisma.adminControls.findFirst();
    if (!controls) {
      controls = await this.prisma.adminControls.create({ data: {} });
    }
    res.json({ data: controls, message: 'Admin controls retrieved' });
  };

  update = async (req: Request, res: Response): Promise<void> => {
    const {
      adminTwoLevel,
      adminManagerOnly,
      adminAdditionalApproval,
      adminApprover,
      signInStyle,
      signUpStyle,
      forgotPasswordStyle,
      theme,
      updatedBy,
    } = req.body;

    const updateData: Record<string, unknown> = {};
    if (adminTwoLevel !== undefined) updateData.adminTwoLevel = adminTwoLevel;
    if (adminManagerOnly !== undefined) updateData.adminManagerOnly = adminManagerOnly;
    if (adminAdditionalApproval !== undefined)
      updateData.adminAdditionalApproval = adminAdditionalApproval;
    if (adminApprover !== undefined) updateData.adminApprover = adminApprover;
    if (signInStyle !== undefined) updateData.signInStyle = signInStyle;
    if (signUpStyle !== undefined) updateData.signUpStyle = signUpStyle;
    if (forgotPasswordStyle !== undefined) updateData.forgotPasswordStyle = forgotPasswordStyle;
    if (theme !== undefined) updateData.theme = theme;
    if (updatedBy !== undefined) updateData.updatedBy = updatedBy;

    let controls = await this.prisma.adminControls.findFirst();
    if (!controls) {
      controls = await this.prisma.adminControls.create({ data: { ...updateData } });
    } else {
      controls = await this.prisma.adminControls.update({
        where: { id: controls.id },
        data: updateData,
      });
    }
    res.json({ data: controls, message: 'Admin controls updated' });
  };
}
