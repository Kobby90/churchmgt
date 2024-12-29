import { Request, Response, NextFunction } from 'express';
import { db } from '@/lib/db';

export const privacyMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get the requested member's privacy settings
    const memberId = req.params.id || req.body.member_id;
    
    if (!memberId) {
      return next();
    }

    const { rows: [member] } = await db.query(
      'SELECT profile_privacy FROM members WHERE id = $1',
      [memberId]
    );

    if (!member) {
      return next();
    }

    // Check if the requesting user has permission to access the data
    const requestingUserId = req.user.id;
    const { rows: [requestingMember] } = await db.query(
      'SELECT role FROM members WHERE auth_id = $1',
      [requestingUserId]
    );

    const isAdmin = requestingMember?.role === 'admin';
    const isSelf = memberId === requestingMember?.id;

    if (!isAdmin && !isSelf) {
      // Filter out private information based on privacy settings
      const privacy = member.profile_privacy;
      
      if (req.method === 'GET') {
        const responseData = { ...req.body };
        
        if (!privacy.show_email) delete responseData.email;
        if (!privacy.show_phone) delete responseData.phone;
        if (!privacy.show_address) delete responseData.address;
        if (!privacy.show_birthday) delete responseData.date_of_birth;
        if (!privacy.show_anniversary) delete responseData.anniversary_date;
        
        req.body = responseData;
      }
    }

    next();
  } catch (error) {
    console.error('Privacy middleware error:', error);
    next(error);
  }
}; 